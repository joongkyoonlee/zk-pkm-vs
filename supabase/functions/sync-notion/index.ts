// @ts-types="https://deno.land/std@0.168.0/http/server.ts"
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-types="https://esm.sh/@supabase/supabase-js@2"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotionPage {
  id: string
  properties: Record<string, any>
  created_time: string
  last_edited_time: string
}

async function fetchNotionPages(notionToken: string, pageSize = 100) {
  const response = await fetch('https://api.notion.com/v1/search', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${notionToken}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filter: {
        value: 'page',
        property: 'object',
      },
      page_size: pageSize,
    }),
  })

  if (!response.ok) {
    throw new Error(`Notion API error: ${response.status}`)
  }

  return response.json()
}

async function fetchNotionPageContent(pageId: string, notionToken: string) {
  const response = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
    headers: {
      Authorization: `Bearer ${notionToken}`,
      'Notion-Version': '2022-06-28',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch page content: ${response.status}`)
  }

  return response.json()
}

function extractTextFromBlocks(blocks: any[]): string {
  return blocks
    .map((block: any) => {
      if (block.type === 'paragraph' && block.paragraph?.rich_text) {
        return block.paragraph.rich_text.map((t: any) => t.plain_text).join('')
      }
      if (block.type === 'heading_1' && block.heading_1?.rich_text) {
        return block.heading_1.rich_text.map((t: any) => t.plain_text).join('')
      }
      if (block.type === 'heading_2' && block.heading_2?.rich_text) {
        return block.heading_2.rich_text.map((t: any) => t.plain_text).join('')
      }
      if (block.type === 'heading_3' && block.heading_3?.rich_text) {
        return block.heading_3.rich_text.map((t: any) => t.plain_text).join('')
      }
      return ''
    })
    .filter((text: string) => text.length > 0)
    .join('\n\n')
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Verify user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's Notion token from metadata
    const { data: userData, error: userError } = await supabase.auth.getUser(token)
    const notionToken = userData?.user?.user_metadata?.notion_token

    if (!notionToken) {
      return new Response(
        JSON.stringify({ error: 'Notion token not found. Please connect your Notion account first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch pages from Notion
    const searchResult = await fetchNotionPages(notionToken)
    const pages = searchResult.results || []

    let syncedCount = 0
    const errors: string[] = []

    // Process each page
    for (const page of pages) {
      try {
        if (page.object !== 'page') continue

        const pageTitle = page.properties?.Title?.title?.[0]?.plain_text || 'Untitled'
        const pageId = page.id

        // Fetch page content
        const contentResult = await fetchNotionPageContent(pageId, notionToken)
        const content = extractTextFromBlocks(contentResult.results || [])

        // Check if note already exists
        const { data: existingNote } = await supabase
          .from('notes')
          .select('id')
          .eq('user_id', user.id)
          .eq('source', 'notion')
          .eq('notion_page_id', pageId)
          .single()

        if (!existingNote) {
          // Create new note
          const { error: insertError } = await supabase
            .from('notes')
            .insert({
              user_id: user.id,
              title: pageTitle,
              content: content || pageTitle,
              source: 'notion',
              notion_page_id: pageId,
              created_at: page.created_time,
              updated_at: page.last_edited_time,
            })

          if (!insertError) {
            syncedCount++
          } else {
            errors.push(`Failed to sync "${pageTitle}": ${insertError.message}`)
          }
        } else {
          syncedCount++
        }
      } catch (pageError) {
        errors.push(`Error processing page: ${pageError}`)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notion sync completed',
        syncedCount,
        totalPages: pages.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

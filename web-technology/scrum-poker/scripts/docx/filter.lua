-- pandoc-Filter für DOKUMENTATION.md → Word. Aufruf über ../build-docx.sh.
--
-- Bereitet den Markdown-Inhalt für die HWZ-Vorlage vor. build_docx.py ersetzt
-- danach die Marker (@@…@@) durch Word-Elemente:
--   @@CAP|Abbildung|text@@     Beschriftung mit SEQ-Feld
--   @@BILDER|spalten@@ … @@ZELLE@@ … @@BILDER_ENDE@@   Bildraster als Tabelle
-- Platzhalter für die Gruppe (HTML-Kommentare «TODO Gruppe») werden als Text mit
-- der Zeichenvorlage «Platzhalter» sichtbar gemacht (build_docx.py: gelb).

local REPO_BLOB = 'https://github.com/gotazlib/school/blob/main/goerkem/web-technology/scrum-poker/'

local mermaid_dir = '.'
local last_heading = ''

local function marker(text)
  return pandoc.Para({ pandoc.Str(text) })
end

local function placeholder(text)
  return pandoc.Span({ pandoc.Str(text) }, { ['custom-style'] = 'Platzhalter' })
end

local function todo_text(raw)
  local text = raw:match('^%s*<!%-%-%s*(TODO Gruppe:.-)%s*%-%->%s*$')
  if text then return '[' .. text .. ']' end
  return nil
end

-- Links: Anker im selben Dokument werden zu Text, relative Pfade zeigen auf GitHub
local function fix_link(link)
  if link.target:match('^#') then return link.content end
  if not link.target:match('^%a[%w+.-]*:') then
    link.target = REPO_BLOB .. link.target:gsub('^%./', '')
  end
  return link
end

-- «## 3. Titel» → Überschrift 1 «Titel» (die Vorlage nummeriert selbst)
local function fix_header(h)
  if h.level == 1 then return {} end
  h.level = h.level - 1
  local first = h.content[1]
  if first and first.t == 'Str' and first.text:match('^%d+[%.%d]*$') then
    h.content:remove(1)
    if h.content[1] and h.content[1].t == 'Space' then h.content:remove(1) end
  end
  last_heading = pandoc.utils.stringify(h.content)
  return h
end

local function only_image(cell)
  local blocks = cell.contents
  if #blocks ~= 1 or (blocks[1].t ~= 'Plain' and blocks[1].t ~= 'Para') then return nil end
  local inlines = blocks[1].content
  if #inlines == 1 and inlines[1].t == 'Image' then return inlines[1] end
  return nil
end

-- Tabelle, deren Zellen nur Bilder enthalten → Bildraster mit Beschriftungen.
-- Die Kopfzeile wird zum Titel der Beschriftung, der Alt-Text zur Erklärung.
local function image_grid(tbl)
  local head = tbl.head.rows[1]
  local body = tbl.bodies[1]
  if not head or not body or #body.body == 0 then return nil end
  local images = {}
  for _, row in ipairs(body.body) do
    for i, cell in ipairs(row.cells) do
      local image = only_image(cell)
      if not image then return nil end
      local title = pandoc.utils.stringify(head.cells[i].contents)
      table.insert(images, { image = image, title = title })
    end
  end
  local blocks = { marker('@@BILDER|' .. #head.cells .. '@@') }
  for i, entry in ipairs(images) do
    if i > 1 then table.insert(blocks, marker('@@ZELLE@@')) end
    local alt = pandoc.utils.stringify(entry.image.caption)
    entry.image.caption = {}
    table.insert(blocks, pandoc.Para({ entry.image }))
    table.insert(blocks, marker('@@CAP|Abbildung|' .. entry.title .. ': ' .. alt .. '@@'))
  end
  table.insert(blocks, marker('@@BILDER_ENDE@@'))
  return blocks
end

local function mermaid(block)
  local file = mermaid_dir .. '/' .. pandoc.utils.sha1(block.text) .. '.png'
  return {
    pandoc.Para({ pandoc.Image({}, file) }),
    marker('@@CAP|Abbildung|' .. last_heading .. ' (Diagramm)@@'),
  }
end

local function convert_blocks(blocks)
  local result = pandoc.List()
  for _, block in ipairs(blocks) do
    local new = block
    if block.t == 'Header' then
      new = fix_header(block)
    elseif block.t == 'HorizontalRule' then
      new = {}
    elseif block.t == 'RawBlock' and block.format == 'html' then
      local text = todo_text(block.text)
      new = text and pandoc.Para({ placeholder(text) }) or {}
    elseif block.t == 'CodeBlock' and block.classes:includes('mermaid') then
      new = mermaid(block)
    elseif block.t == 'Table' then
      new = image_grid(block) or block
    end
    if new.t then result:insert(new) else result:extend(new) end
  end
  return result
end

-- Vor dem ersten Kapitel stehen Titel, Metadaten-Tabelle und ein Inhaltsverzeichnis
-- von Hand. In Word übernehmen das Titelblatt und das Inhaltsverzeichnis-Feld.
-- Erhalten bleiben die einleitenden Absätze und die Zeile «Repository»; sie kommen
-- an den Anfang von Kapitel 1.
local function move_intro(blocks)
  local intro, repo, rest, before = pandoc.List(), pandoc.List(), pandoc.List(), true
  for _, block in ipairs(blocks) do
    if before and block.t == 'Header' and block.level == 2 then before = false end
    if not before then
      rest:insert(block)
    elseif block.t == 'Para' and pandoc.utils.stringify(block) ~= 'Inhalt' then
      intro:insert(block)
    elseif block.t == 'Table' then
      for _, row in ipairs(block.bodies[1].body) do
        local key = pandoc.utils.stringify(row.cells[1].contents)
        if key == 'Repository' then
          local value = row.cells[2].contents[1].content
          repo:insert(pandoc.Para({ pandoc.Strong({ pandoc.Str('Repository:') }), pandoc.Space() } .. value))
        end
      end
    end
  end
  intro:extend(repo)
  -- direkt nach der Überschrift von Kapitel 1 einsetzen
  local out = pandoc.List({ rest[1] })
  out:extend(intro)
  for i = 2, #rest do out:insert(rest[i]) end
  return out
end

function Pandoc(doc)
  if doc.meta['mermaid-dir'] then mermaid_dir = pandoc.utils.stringify(doc.meta['mermaid-dir']) end
  local blocks = move_intro(doc.blocks)
  blocks = pandoc.Blocks(blocks):walk({ Link = fix_link })
  doc.blocks = convert_blocks(blocks)
  return doc
end

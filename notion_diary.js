// Notion 日记同步模块
const NOTION_API = "https://api.notion.com/v1";

async function writeToNotion(content, dateString) {
  const token = process.env.NOTION_TOKEN;
  const pageId = process.env.NOTION_PAGE_ID;
  
  if (!token || !pageId) {
    console.log("NOTION_TOKEN 或 NOTION_PAGE_ID 未配置，跳过 Notion 写入");
    return false;
  }

  const blocks = content.split("\n").filter(line => line.trim()).map(line => ({
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [{ type: "text", text: { content: line } }]
    }
  }));

  blocks.unshift({
    object: "block",
    type: "heading_2",
    heading_2: {
      rich_text: [{ type: "text", text: { content: dateString || new Date().toISOString().slice(0, 16) } }]
    }
  });

  blocks.push({
    object: "block",
    type: "divider",
    divider: {}
  });

  try {
    const response = await fetch(`${NOTION_API}/blocks/${pageId}/children`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify({ children: blocks })
    });

    if (!response.ok) {
      const text = await response.text();
      console.log(`Notion 写入失败 (HTTP ${response.status}): ${text.slice(0, 200)}`);
      return false;
    }

    console.log("已同步日记到 Notion");
    return true;
  } catch (err) {
    console.log("Notion 写入出错:", err.message);
    return false;
  }
}

module.exports = { writeToNotion };

import type { Html, ListItem, Root, Text } from "mdast";
import type { Node, Parent } from "unist";

const CHECK_COMMENT = /^<!--\s*check:([a-z0-9-]+)\s*-->$/;

function isParent(node: Node): node is Parent {
  return "children" in node && Array.isArray((node as Parent).children);
}

function isWhitespaceText(node: Node | undefined): node is Text {
  return (
    node?.type === "text" &&
    typeof (node as Text).value === "string" &&
    /^\s*$/.test((node as Text).value)
  );
}

function findAndRemoveCheckId(item: ListItem): string | undefined {
  const stack: Parent[] = [item];

  while (stack.length > 0) {
    const parent = stack.pop()!;
    for (let i = 0; i < parent.children.length; i++) {
      const child = parent.children[i]!;
      if (child.type === "html") {
        const match = CHECK_COMMENT.exec((child as Html).value.trim());
        if (match) {
          parent.children.splice(i, 1);
          // Drop a leftover whitespace-only text node beside the comment.
          if (isWhitespaceText(parent.children[i - 1])) {
            parent.children.splice(i - 1, 1);
          } else if (isWhitespaceText(parent.children[i])) {
            parent.children.splice(i, 1);
          }
          return match[1];
        }
      }
      if (isParent(child)) stack.push(child);
    }
  }

  return undefined;
}

function visitListItems(node: Node, visit: (item: ListItem) => void) {
  if (node.type === "listItem") {
    visit(node as ListItem);
  }
  if (isParent(node)) {
    for (const child of node.children) {
      visitListItems(child, visit);
    }
  }
}

/** Attach `data-check-id` from `<!-- check:id -->` on GFM task list items. */
export function remarkCheckId() {
  return (tree: Root) => {
    visitListItems(tree, (item) => {
      if (typeof item.checked !== "boolean") return;
      const checkId = findAndRemoveCheckId(item);
      if (!checkId) return;
      item.data ??= {};
      item.data.hProperties ??= {};
      (item.data.hProperties as Record<string, string>)["data-check-id"] =
        checkId;
    });
  };
}

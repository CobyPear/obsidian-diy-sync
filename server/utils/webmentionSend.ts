import { Node } from "@prisma/client";
import { prisma } from "../db";
import { parse } from "node-html-parser";
//  Discovery for webmentions:
// webmention POST
type n = "path" | "content" | "name" | "mtime" | "webmentionTime";
/**
 * For content tagged with `#published` and `#webmention`,
 * this function should satisfy section 3.1.3 of the Webmention spec
 *  @see {@link https://www.w3.org/TR/webmention/#h-sender-notifies-receiver}
 */
export const webmentionSend = async ({
  path,
  content,
  name,
  mtime,
  webmentionTime,
}: Pick<Node, n>) => {
  if (
    content.includes("#webmention") &&
    content.includes("#published") &&
    (!webmentionTime || webmentionTime !== mtime)
  ) {
    const postDOM = parse(content);
    const webmentionTarget = postDOM
      .querySelector("a.u-in-reply-to")
      ?.getAttribute("href");

    if (webmentionTarget) {
      let targetDOM;
      try {
        const targetRes = await fetch(webmentionTarget, {
          headers: {
            "User-Agent": `${process.env.WEBMENTION_USER_AGENT} Webmention`,
          },
        });
        targetDOM = parse(await targetRes.text());
      } catch (error) {
        console.error("Error fetching webmention target", error);
        return;
      }
      const validPermalink = targetDOM
        .querySelector("[rel=webmention]")
        ?.getAttribute("href");

      if (validPermalink) {
        try {
          const title = name.replace(/\.md$/g, "");
          const slug = title.replace(/\s/g, "-").toLowerCase();
          const source = `${process.env.BLOG_URL}/${slug}`;
          const req = await fetch(
            `${validPermalink}?target=${webmentionTarget}&source=${source}`,
            {
              method: "POST",
              headers: {
                "User-Agent": `${process.env.WEBMENTION_USER_AGENT} Webmention`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          );
          console.log("Webmention POST status:", req.status);
          const result = await req.json();
          console.log("Webmention POST result:", result);
          // update webmention time so that we don't spam the target webmention server
          if (webmentionTime !== mtime) {
            try {
              await prisma.node.update({
                where: {
                  path,
                },
                data: {
                  webmentionTime: mtime,
                },
              });
            } catch (error) {
              console.error("Error updating webmentionTime", error);
            }
          }
          return;
        } catch (error) {
          console.log(error);
        }
      }
      console.error("No valid permalink found in target");
    }
    console.error("No webmentionTarget found in content");
  }
};

import { Node } from "@prisma/client";
import { parse } from "node-html-parser";
//  Discovery for webmentions:
// webmention POST
type n = "content" | "name";
export const webmentionSend = async ({ content, name }: Pick<Node, n>) => {
  if (content.includes("#webmention") && content.includes("#published")) {
    const postDOM = parse(content);
    const webmentionTarget = postDOM
      .querySelector("a.u-in-reply-to")
      ?.getAttribute("href");
    console.log(webmentionTarget);
    if (webmentionTarget) {
      let targetDOM;
      try {
        const targetRes = await fetch(webmentionTarget, {
          headers: { "User-Agent": "cobysher.dev Webmention" },
        });
        targetDOM = parse(await targetRes.text());
      } catch (error) {
        console.error("Error fetching webmention target", error);
        return;
      }
      const validPermalink = targetDOM
        .querySelector("[rel=webmention]")
        ?.getAttribute("href");
      console.log("validPermalink", validPermalink);

      if (validPermalink) {
        try {
          const title = name.replace(/\.md$/g, "");
          const slug = title.replace(/\s/g, "-").toLowerCase();
          const source = `https://www.cobysher.dev/blog/${slug}`;
          const req = await fetch(
            `${validPermalink}?target=${webmentionTarget}&source=${source}`,
            {
              method: "POST",
              headers: {
                "User-Agent": "cobysher.dev Webmention",
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          );
          console.log(req.status);
          const result = await req.json();
          console.log("result", result);
          return;
        } catch (error) {
          console.log(error);
        }
      }
    }
  }
};

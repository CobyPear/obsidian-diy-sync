import { prisma } from '../db';
import { parse } from 'node-html-parser';
import type { Node, Webmention } from '@prisma/client';
//  Discovery for webmentions:
// webmention POST
type n = 'id' | 'content' | 'name' | 'mtime';
/**
 * For content tagged with `#published` and `#webmention`,
 * this function should satisfy section 3.1.3 of the Webmention spec
 *  @see {@link https://www.w3.org/TR/webmention/#h-sender-notifies-receiver}
 */
export const webmentionSend = async ({
	id: nodeId,
	content,
	name,
	mtime,
	webmentions,
}: Pick<Node, n> & { webmentions: Webmention[] }) => {
	if (content.includes('#webmention') && /#published|#unpublished|#deleted/.test(content)) {
		const postDOM = parse(content);
		// get all webmention targets from the post and from the DB
		// then dedupe
		let webmentionTargets = postDOM
			.querySelectorAll('a.u-in-reply-to')
			.map((element) => element.getAttribute('href'));
		if (webmentions) {
			webmentionTargets.push(
				...webmentions.map(({ target }: { target: string }) => target)
			);
		}
		webmentionTargets = [...new Set(webmentionTargets)];

		for await (const webmentionTarget of webmentionTargets) {
			if (!webmentionTarget) continue;

			// continue if post hasn't been updated
			if (
				webmentions?.find(({ target }) => target === webmentionTarget)
					?.webmentionTime === mtime
			)
				continue;

			let targetDOM;
			let validPermalink: string | undefined;
			try {
				console.log('Webmention found in content. Validating...');
				const targetRes = await fetch(webmentionTarget, {
					headers: {
						'User-Agent': `${process.env.WEBMENTION_USER_AGENT} Webmention`,
					},
				});
				const linkHeader = targetRes.headers.get('Link');
				if (linkHeader) {
					const matches = linkHeader.match(
						/<([\d\w\/\:\.]+)>;\s+?(?=rel="?webmention"?)/g
					);

					// TODO: validate matches in case multiple matches and one is undefined
					if (matches) {
						const [match] = matches.filter((match) => match !== undefined);

						validPermalink = match
							?.trim()
							.replace('<', '')
							.replace('>', '')
							.replace(';', '');
					}
				}
				targetDOM = parse(await targetRes.text());
			} catch (error) {
				console.error('Error fetching webmention target', error);
				continue;
			}

			validPermalink =
				validPermalink ||
				targetDOM
					.querySelectorAll('[rel^=webmention]')
					.find((element) => element?.hasAttribute('href'))
					?.getAttribute('href');

			validPermalink = !validPermalink?.startsWith('http')
				? new URL(validPermalink as string, webmentionTarget).href
				: validPermalink;

			if (!validPermalink) {
				console.error('validPermalink not found');
				continue;
			}
			console.log('POSTing to ', validPermalink);
			try {
				const title = name.replace(/\.md$/g, '');
				const slug = title.replace(/\s/g, '-').toLowerCase();
				const source = `${process.env.BLOG_URL}/${slug}`;
				const params = new URLSearchParams({
					source,
					target: webmentionTarget,
				});
				// maintain query params
				const prefix = /\?[\w\d]+=/.test(validPermalink) ? '&' : '?';
				const req = await fetch(
					`${validPermalink}${prefix}${params.toString()}`,
					{
						method: 'POST',
						body: params,
						redirect: 'follow',
						headers: {
							'User-Agent': `${process.env.WEBMENTION_USER_AGENT} Webmention`,
							'Content-Type': 'application/x-www-form-urlencoded',
						},
					}
				);
				console.log('Webmention POST status:', req.status);
				const result = await req.text();
				console.log('Webmention POST result:', result);

				const webmentionID = webmentions?.find(
					({ target }) => target === webmentionTarget
				)?.id;

				if (!content.includes(webmentionTarget)) {
					const prismaResult = await prisma.webmention.delete({
						where: {
							id: webmentionID,
						},
					});
					console.log('record deleted', prismaResult);
				} else {
					if (!webmentionID) {
						// create or update the webmention record in the node
						const newWebmentionRecord = await prisma.webmention.create({
							data: {
								nodeId,
								target: webmentionTarget,
								webmentionTime: mtime,
							},
						});
						console.log('record created', newWebmentionRecord);
					} else {
						const updatedWebmentionRecord = await prisma.webmention.update({
							where: {
								id: webmentionID,
							},
							data: {
								webmentionTime: mtime,
							},
						});
						console.log('record updated', updatedWebmentionRecord);
					}
				}
			} catch (error) {
				console.log(error);
			}

			console.error(`No valid permalink found in ${webmentionTarget}`);
		}
	}
};

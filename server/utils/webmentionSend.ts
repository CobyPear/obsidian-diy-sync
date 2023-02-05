import { Node } from '@prisma/client';
import { prisma } from '../db';
import { parse } from 'node-html-parser';
//  Discovery for webmentions:
// webmention POST
type n = 'path' | 'content' | 'name' | 'mtime' | 'webmentionTime';
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
		content.includes('#webmention') &&
		content.includes('#published') &&
		(!webmentionTime || webmentionTime !== mtime)
	) {
		const postDOM = parse(content);
		const webmentionTargets = postDOM
			.querySelectorAll('a.u-in-reply-to')
			.map((element) => element.getAttribute('href'));

		for await (const webmentionTarget of webmentionTargets) {
			if (webmentionTarget) {
				let targetDOM;
				let validPermalink;
				try {
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

				if (validPermalink) {
					console.log('POSTing to ', validPermalink);
					try {
						const title = name.replace(/\.md$/g, '');
						const slug = title.replace(/\s/g, '-').toLowerCase();
						const source = `${process.env.BLOG_URL}/${slug}`;
						const params = new URLSearchParams({
							source,
							target: webmentionTarget,
						});
						// maintain query params?
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
						console.log(`${validPermalink}${prefix}${params}`);
						console.log('Webmention POST status:', req.status);
						const result = await req.text();
						console.log('Webmention POST result:', result);
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
								console.error('Error updating webmentionTime', error);
							}
						}
					} catch (error) {
						console.log(error);
					}
				}
				console.error(`No valid permalink found in ${webmentionTarget}`);
			}
		}
		console.error('No webmentionTarget found in content');
	}
    return;
};

import { query } from './db.js';

/**
 * Higher-order fall sem umlykur async middleware með villumeðhöndlun.
 *
 * @param {function} fn Middleware sem grípa á villur fyrir
 * @returns {function} Middleware með villumeðhöndlun
 */
export function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

export async function paging(offset, port, link='') {
  let result = '';
  let ceiling = '';
  let outOfBounds = '';
  let c = '';
  try {
    const cnt = await query('SELECT COUNT(*) AS count FROM signatures');
    c = cnt.rows[0].count;
    ceiling = Math.ceil(c/50);
    outOfBounds = (offset>ceiling) ? true : false;
    result = await query('SELECT * FROM signatures ORDER BY signed OFFSET $1 LIMIT $2',[(offset-1)*50,50]);
  } catch(e) {
    throw new Error(e);
  }
    const pages = {
      _links: {
        self: {
          href: `http://localhost:${port}/${link}?page=${offset}`,
        },
      },
      rows: result.rows,
      ceil: ceiling,
      page: offset,
      bool: outOfBounds,
      count: c,
    };

    if (offset > 1) {
      pages._links.prev = {
        href: `http://localhost:${port}/${link}?page=${offset - 1}`,
      };
    }

    if (result.rows.length <= 50 && !(offset>=ceiling)) {
      pages._links.next = {
        href: `http://localhost:${port}/${link}?page=${Number(offset) + 1}`,
      };
    }
    return pages;
}

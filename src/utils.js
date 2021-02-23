import { query } from './db.js';

export async function paging(offset, port, link = '') {
  let result = '';
  let ceiling = '';
  let outOfBounds = '';
  let c = '';
  try {
    const cnt = await query('SELECT COUNT(*) AS count FROM signatures');
    c = cnt.rows[0].count;
    ceiling = Math.ceil(c / 50);
    ceiling = ceiling > 0 ? ceiling : 1;
    outOfBounds = (offset > ceiling);
    result = await query('SELECT * FROM signatures ORDER BY signed DESC OFFSET $1 LIMIT $2', [(offset - 1) * 50, 50]);
  } catch (e) {
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

  if (result.rows.length <= 50 && !(offset >= ceiling)) {
    pages._links.next = {
      href: `http://localhost:${port}/${link}?page=${Number(offset) + 1}`,
    };
  }
  return pages;
}

export async function deleteFromTable(id) {
  try {
    await query('DELETE FROM signatures WHERE id = $1', [id]);
  } catch (e) {
    throw new Error(e);
  }
}

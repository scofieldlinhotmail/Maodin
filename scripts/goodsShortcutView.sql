CREATE VIEW `goodsShortcutViews` AS
select id, title,
price, oldPrice,
mainImg, status,
integral, capacity,
baseSoldNum + soldNum as compoundSoldNum,
createdAt
from yiwo.goods where deletedAt is null;
CREATE VIEW `goodsShortcutViews` AS
select id, title,
price, oldPrice,
mainImg, status,
integral, capacity,
baseSoldNum + soldNum as compoundSoldNum,
createdAt, goodsTypeId
from yiwo.Goods where deletedAt is null;


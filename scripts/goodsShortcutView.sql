CREATE VIEW `goodsShortcutViews` AS
select id, title,
--commission1, commission2, commission3,
price, oldPrice,
mainImg, status,
integral, capacity,
baseSoldNum + soldNum as compoundSoldNum,
createdAt
from yiwo.goods;

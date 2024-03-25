const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  try {
    const tags = await Tag.findAll({
      include: [{ model: Product, through: ProductTag }]
    })
    res.status(200).json(tags);
  } catch (err) {
    res.status(500).json(err)
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tag = await Tag.findOne({
      where: { id: req.params.id },
      include: [{ model: Product, through: ProductTag }]
    })
    if (!tag) {
      res.status(404).json({ message: "Tag not Found" })
    }
    res.status(200).json(tag);
  } catch (err) {
    res.status(500).json(err)
  }
});

router.post('/', async (req, res) => {
  /* req.body should look like this...
      {
        tag_name: "tag_name",
        product_ids: [ product_id, product_id, product_id....]
      }
    */
  try {
    const tag = await Tag.create(req.body);

    if (req.body.product_ids.length) {
      const productTagIdArr = req.body.product_ids.map((product_id) => {
        return {
          product_id,
          tag_id: tag.id
        };
      });
      const productTagIds = await ProductTag.bulkCreate(productTagIdArr)
      res.status(200).json(productTagIds)
      return;
    }

    res.status(200).json(tag)
  } catch (err) {
    res.status(500).json(err)
  };

});

router.put('/:id', async (req, res) => {
  /* req.body should look like this...
    {
      tag_name: "tag_name",
      product_ids: [ product_id, product_id, product_id....]
    }
  */
  try {
    const tag = await Tag.update({ tag_name: req.body.tag_name, }, { where: { id: req.params.id } })
    // if (!tag[0]) {
    //   res.status(404).json({ message: 'No tag with this id!' });
    //   return;
    // }

    if (req.body.product_ids.length) {
      const oldProductTagIds = await ProductTag.destroy({ where: { tag_id: req.params.id } })
      const productTagIdArr = req.body.product_ids.map((product_id) => {
        return {
          product_id,
          tag_id: req.params.id
        };
      });
      const newProductTagIds = await ProductTag.bulkCreate(productTagIdArr)
      res.status(200).json(newProductTagIds)
      return
    }

    res.status(200).json(tag);
  } catch (err) {
    res.status(500).json(err)
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedTag = await Tag.destroy({ where: { id: req.params.id } });
    if (!deletedTag) {
      res.status(404).json({ message: 'No tag with this id!' });
      return;
    }
    const oldProductTagIds = await ProductTag.destroy({ where: { tag_id: req.params.id } })
    res.status(200).json(deletedTag);
  } catch (err) {
    res.status(500).json(err)
  }
});

module.exports = router;

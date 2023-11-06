const {Scenes} = require('telegraf');

const partiesScene = new Scenes.BaseScene('parties-scene', {} )

partiesScene.enter((ctx) => {
    ctx.reply('Parties scene. Hello and Bye!');
    return ctx.scene.leave();
})

module.exports = partiesScene

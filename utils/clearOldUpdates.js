const { Update } = require('../models')
const { Op } = require('sequelize')

const clearOldUpdates = (interval = 1000 * 60 * 60 * 6) => {
    setTimeout(async () => {
        const updates = await Update.destroy({
            where: {
                createdAt: {
                    [Op.lt]: Number(new Date()) - (1000 * 60 * 60 * 24 * 2) // two days old
                }
            }
        })
        console.log('deleting updates...'.red, JSON.stringify(updates))
        clearOldUpdates(interval)
    }, interval)
}

module.exports = clearOldUpdates
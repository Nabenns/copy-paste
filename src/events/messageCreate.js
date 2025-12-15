const { Events } = require('discord.js');
const { getServerConfig, getChannelMapping } = require('../database');
const { WebhookClient } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Ignore bot messages to prevent loops (though webhooks are bots, we check ID)
        if (message.author.bot) return;

        const config = getServerConfig();
        if (!config || !config.active) return;

        // Check if message is from source server
        if (message.guild.id !== config.source_id) return;

        // Find mapped channel
        const mapping = getChannelMapping(message.channel.id);
        if (!mapping) return;

        try {
            const webhookClient = new WebhookClient({ id: mapping.webhook_id, token: mapping.webhook_token });

            // Prepare message options
            const options = {
                content: message.content,
                username: message.author.username,
                avatarURL: message.author.displayAvatarURL(),
                files: message.attachments.map(a => a.url),
                embeds: message.embeds,
            };

            // Send to webhook
            await webhookClient.send(options);
        } catch (error) {
            console.error('Error mirroring message:', error);
        }
    },
};

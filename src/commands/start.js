const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { getServerConfig, setBotActive, saveChannelMapping, getChannelMapping, clearChannelMappings } = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Start the mirroring process (clones structure and creates webhooks).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const config = getServerConfig();
        if (!config) {
            return interaction.editReply('Please run /setup first.');
        }

        const sourceGuild = await interaction.client.guilds.fetch(config.source_id).catch(() => null);
        const targetGuild = await interaction.client.guilds.fetch(config.target_id).catch(() => null);

        if (!sourceGuild || !targetGuild) {
            return interaction.editReply('Could not fetch one or both servers. Make sure the bot is in both servers.');
        }

        setBotActive(true);
        await interaction.editReply('Starting mirroring process... This will DELETE ALL channels in the target server and recreate them. This may take a while.');

        // 1. Clean Start: Delete all channels in target guild
        const targetChannels = await targetGuild.channels.fetch();
        for (const [id, channel] of targetChannels) {
            try {
                await channel.delete();
            } catch (error) {
                console.error(`Failed to delete channel ${channel.name}:`, error);
            }
        }

        // Clear old mappings since we wiped the server
        clearChannelMappings();

        // 2. Fetch Source Channels
        const sourceChannels = await sourceGuild.channels.fetch();
        const sortedChannels = sourceChannels.sort((a, b) => a.position - b.position);

        // 3. Clone Categories first
        const categoryMapping = new Map(); // sourceCategoryId -> targetCategoryId

        for (const [id, channel] of sortedChannels) {
            if (channel.type === ChannelType.GuildCategory) {
                try {
                    const newCategory = await targetGuild.channels.create({
                        name: channel.name,
                        type: ChannelType.GuildCategory,
                        position: channel.position,
                    });
                    categoryMapping.set(id, newCategory.id);
                } catch (error) {
                    console.error(`Failed to create category ${channel.name}:`, error);
                }
            }
        }

        // 4. Clone Text Channels and put them in categories
        let createdCount = 0;

        for (const [id, channel] of sortedChannels) {
            if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement) continue;

            try {
                const targetParentId = channel.parentId ? categoryMapping.get(channel.parentId) : null;

                const newChannel = await targetGuild.channels.create({
                    name: channel.name,
                    type: channel.type,
                    parent: targetParentId,
                    position: channel.position,
                    topic: channel.topic,
                    nsfw: channel.nsfw,
                    rateLimitPerUser: channel.rateLimitPerUser,
                });

                // Create Webhook
                const webhook = await newChannel.createWebhook({
                    name: 'Mirror Webhook',
                    avatar: interaction.client.user.displayAvatarURL(),
                });

                saveChannelMapping(id, newChannel.id, webhook.id, webhook.token);
                createdCount++;

            } catch (error) {
                console.error(`Failed to mirror channel ${channel.name}:`, error);
            }
        }

        await interaction.editReply(`Mirroring started! Recreated structure with ${createdCount} channels.`);
    },
};

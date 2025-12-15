const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getServerConfig, getAllChannelMappings } = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Check the status of the mirroring bot.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const config = getServerConfig();
        const mappings = getAllChannelMappings();

        let statusMsg = '**Mirror Bot Status**\n';

        if (!config) {
            statusMsg += '🔴 Not Configured (Run /setup)\n';
        } else {
            statusMsg += `🟢 Configured\n`;
            statusMsg += `**Source Server:** ${config.source_id}\n`;
            statusMsg += `**Target Server:** ${config.target_id}\n`;
            statusMsg += `**Active:** ${config.active ? 'Yes' : 'No'}\n`;
        }

        statusMsg += `**Mapped Channels:** ${mappings.length}\n`;

        await interaction.reply({ content: statusMsg, ephemeral: true });
    },
};

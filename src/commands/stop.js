const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setBotActive } = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop the mirroring process.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        setBotActive(false);
        await interaction.reply({ content: 'Mirroring stopped. Webhooks are preserved.', ephemeral: true });
    },
};

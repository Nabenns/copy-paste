const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setServerConfig } = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Configure the source and target servers.')
        .addStringOption(option =>
            option.setName('source_id')
                .setDescription('The ID of the source server')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('target_id')
                .setDescription('The ID of the target server')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const sourceId = interaction.options.getString('source_id');
        const targetId = interaction.options.getString('target_id');

        setServerConfig(sourceId, targetId);

        await interaction.reply({ content: `Configuration saved!\nSource Server ID: ${sourceId}\nTarget Server ID: ${targetId}`, ephemeral: true });
    },
};

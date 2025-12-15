const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.json');

// In-memory storage
let data = {
    server: {
        source_id: null,
        target_id: null,
        active: 0
    },
    channels: []
};

function loadDatabase() {
    if (fs.existsSync(dbPath)) {
        try {
            const fileData = fs.readFileSync(dbPath, 'utf8');
            data = JSON.parse(fileData);
        } catch (error) {
            console.error('Error loading database:', error);
            // Keep default data if error
        }
    } else {
        saveDatabase();
    }
}

function saveDatabase() {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving database:', error);
    }
}

function initDatabase() {
    loadDatabase();
    console.log('Database initialized (JSON).');
}

function getServerConfig() {
    return data.server;
}

function setServerConfig(sourceId, targetId) {
    data.server.source_id = sourceId;
    data.server.target_id = targetId;
    data.server.active = 0; // Reset active state on config change
    saveDatabase();
}

function setBotActive(active) {
    data.server.active = active ? 1 : 0;
    saveDatabase();
}

function getChannelMapping(sourceChannelId) {
    return data.channels.find(c => c.source_channel_id === sourceChannelId);
}

function saveChannelMapping(sourceChannelId, targetChannelId, webhookId, webhookToken) {
    const existingIndex = data.channels.findIndex(c => c.source_channel_id === sourceChannelId);

    const mapping = {
        source_channel_id: sourceChannelId,
        target_channel_id: targetChannelId,
        webhook_id: webhookId,
        webhook_token: webhookToken
    };

    if (existingIndex >= 0) {
        data.channels[existingIndex] = mapping;
    } else {
        data.channels.push(mapping);
    }
    saveDatabase();
}

function getAllChannelMappings() {
    return data.channels;
}

function clearChannelMappings() {
    data.channels = [];
    saveDatabase();
}

module.exports = {
    initDatabase,
    getServerConfig,
    setServerConfig,
    setBotActive,
    getChannelMapping,
    saveChannelMapping,
    getAllChannelMappings,
    clearChannelMappings
};

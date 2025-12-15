import discord
import os
import json
import aiohttp
from dotenv import load_dotenv

load_dotenv()

DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')

# Load Mapping
try:
    with open('mapping.json', 'r') as f:
        CHANNEL_MAPPING = json.load(f)
except FileNotFoundError:
    print("mapping.json not found. Run setup_bot.py first.")
    exit(1)

intents = discord.Intents.default()
intents.messages = True
intents.message_content = True

client = discord.Client(intents=intents)

@client.event
async def on_ready():
    print(f'Mirror Bot Logged in as {client.user}')

@client.event
async def on_message(message):
    if message.author == client.user:
        return
    
    # Check if channel is in mapping
    mapping = CHANNEL_MAPPING.get(str(message.channel.id))
    if not mapping:
        return

    webhook_url = mapping.get('webhook_url')
    if not webhook_url:
        return

    try:
        async with aiohttp.ClientSession() as session:
            webhook = discord.Webhook.from_url(webhook_url, session=session)
            
            files = []
            for attachment in message.attachments:
                try:
                    file_data = await attachment.to_file()
                    files.append(file_data)
                except Exception as e:
                    print(f"Failed to download attachment: {e}")

            await webhook.send(
                content=message.content,
                username=message.author.display_name,
                avatar_url=message.author.display_avatar.url,
                embeds=message.embeds,
                files=files,
                wait=True
            )
            # print(f"Mirrored message from {message.author} in {message.channel.name}")

    except Exception as e:
        print(f"Failed to mirror message: {e}")

client.run(DISCORD_TOKEN)

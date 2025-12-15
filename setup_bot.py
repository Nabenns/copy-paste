import discord
import os
import json
import asyncio
from dotenv import load_dotenv

load_dotenv()

DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')
SOURCE_GUILD_ID = int(os.getenv('SOURCE_GUILD_ID'))
TARGET_GUILD_ID = int(os.getenv('TARGET_GUILD_ID'))

intents = discord.Intents.default()
intents.guilds = True
intents.messages = True

client = discord.Client(intents=intents)

@client.event
async def on_ready():
    print(f'Logged in as {client.user}')
    
    source_guild = client.get_guild(SOURCE_GUILD_ID)
    target_guild = client.get_guild(TARGET_GUILD_ID)

    if not source_guild or not target_guild:
        print("Could not find source or target guild. Make sure the bot is in both.")
        await client.close()
        return

    print("Starting setup process...")
    print("WARNING: This will DELETE ALL channels in the target server.")

    # 1. Delete all channels in target
    print("Deleting channels in target server...")
    for channel in target_guild.channels:
        try:
            await channel.delete()
            print(f"Deleted {channel.name}")
        except Exception as e:
            print(f"Failed to delete {channel.name}: {e}")

    # 2. Clone Categories and Channels
    print("Cloning structure...")
    
    # Mapping: source_id -> target_object
    category_mapping = {} 
    channel_mapping = {} # source_id -> {webhook_url, target_id}

    # Get all channels and sort by position
    source_channels = sorted(source_guild.channels, key=lambda c: c.position)

    # First pass: Categories
    for channel in source_channels:
        if isinstance(channel, discord.CategoryChannel):
            try:
                new_category = await target_guild.create_category(
                    name=channel.name,
                    position=channel.position
                )
                category_mapping[channel.id] = new_category
                print(f"Created category: {channel.name}")
                await asyncio.sleep(1)
            except Exception as e:
                print(f"Failed to create category {channel.name}: {e}")

    # Second pass: Text Channels (and others if needed, but focusing on Text for mirroring)
    for channel in source_channels:
        if isinstance(channel, discord.TextChannel):
            try:
                target_category = category_mapping.get(channel.category_id)
                
                new_channel = await target_guild.create_text_channel(
                    name=channel.name,
                    category=target_category,
                    position=channel.position,
                    topic=channel.topic,
                    nsfw=channel.nsfw,
                    slowmode_delay=channel.slowmode_delay
                )
                
                # Create Webhook
                webhook = await new_channel.create_webhook(name="Mirror Webhook")
                
                channel_mapping[str(channel.id)] = {
                    "target_channel_id": new_channel.id,
                    "webhook_url": webhook.url
                }
                print(f"Created channel: {channel.name}")
                
                # Sleep to avoid rate limits (Discord is very strict with channel/webhook creation)
                print("Waiting 10s to avoid rate limits...")
                await asyncio.sleep(10)

            except Exception as e:
                print(f"Failed to create channel {channel.name}: {e}")
                await asyncio.sleep(5) # Wait longer on error

    # 3. Save Mapping
    with open('mapping.json', 'w') as f:
        json.dump(channel_mapping, f, indent=4)
    
    print("Setup complete! Mapping saved to mapping.json")
    await client.close()

client.run(DISCORD_TOKEN)

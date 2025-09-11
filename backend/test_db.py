import asyncio
import asyncpg

async def test_connection():
    database_url = "postgresql://postgres:IozpPP3CFgNog3wt@db.ynbznzckrqqpzjrfgseq.supabase.co:5432/postgres"
    print(f"Testing connection...")
    
    try:
        conn = await asyncpg.connect(database_url, ssl=True)
        result = await conn.fetchval("SELECT 1")
        print(f"✅ Connection successful! Result: {result}")
        await conn.close()
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
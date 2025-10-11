# How to Create Your .env File

## Quick Instructions

The `.env` file is protected by git (for security) so you need to create it manually.

### Windows PowerShell Method:

```powershell
# Make sure you're in the project directory
cd c:\Users\keith\code\etc-website

# Create .env file with MongoDB Atlas connection
@"
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/etc_caucus?retryWrites=true&w=majority
"@ | Out-File -FilePath .env -Encoding utf8
```

**Then edit the file and replace:**
- `<username>` with your MongoDB Atlas username
- `<password>` with your MongoDB Atlas password
- `<cluster>` with your cluster address (e.g., cluster0.abc123)

### Manual Method:

1. Open **Notepad** or **VS Code**
2. Create a new file
3. Add this line:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/etc_caucus?retryWrites=true&w=majority
   ```
4. Replace `<username>`, `<password>`, and `<cluster>` with your actual values
5. Save as `.env` (with a dot at the beginning, no file extension)
6. Save location: `c:\Users\keith\code\etc-website\.env`

### For Local MongoDB (Alternative):

If you're using local MongoDB instead of Atlas:

```
MONGODB_URI=mongodb://localhost:27017/etc_caucus
```

---

## Example .env File

Here's what your `.env` file should look like (with your actual credentials):

```bash
# MongoDB Atlas Cloud Connection
MONGODB_URI=mongodb+srv://myusername:mypassword123@cluster0.abc123.mongodb.net/etc_caucus?retryWrites=true&w=majority
```

---

## Need MongoDB Atlas Credentials?

If you don't have MongoDB Atlas set up yet, see **MONGODB_SETUP.md** for a complete guide.

---

## Verify It Works

After creating your `.env` file, test it:

```bash
# Seed the database (tests connection)
npm run seed

# If successful, you'll see:
# Connected to MongoDB
# Seeded 25 tech items
# Seeded 10 events
```

---

## ⚠️ Important Security Notes

- ✅ `.env` is already in `.gitignore` (won't be committed)
- ✅ Never share your `.env` file publicly
- ✅ Never commit it to git
- ✅ Use different credentials for development vs production

---

**Need help setting up MongoDB Atlas?** See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed instructions.


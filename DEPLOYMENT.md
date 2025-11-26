# Hero Exchange - Deployment Guide

## Cost Estimate: ~$10-15/month total

| Service | Platform | Cost |
|---------|----------|------|
| Frontend (webapp) | Vercel | FREE |
| Admin Console | Vercel | FREE |
| PostgreSQL | Railway | ~$5/month |
| MongoDB | Railway | ~$5/month |
| RabbitMQ | CloudAMQP | FREE (Little Lemur) |
| .NET Services (6) | Railway | FREE tier / ~$5/month |
| Python Bots | Local PC | FREE |

---

## Your Connection Strings

```
PostgreSQL: postgresql://postgres:tEtwsMDEpuDSMAvnxTyjAjVcBrDfZJkz@postgres.railway.internal:5432/railway
MongoDB:    mongodb://mongo:MKnNCIKJIMspHmbRDXsWtACAxXBjRnsi@mongodb.railway.internal:27017
CloudAMQP:  amqps://nucsvqes:uvYH19uvOeeNUoSIjgf27XH0ubeqQ7Rs@hawk.rmq.cloudamqp.com/nucsvqes
```

### Parsed CloudAMQP Values:
- **Host**: `hawk.rmq.cloudamqp.com`
- **Username**: `nucsvqes`
- **Password**: `uvYH19uvOeeNUoSIjgf27XH0ubeqQ7Rs`
- **VirtualHost**: `nucsvqes`

---

## Step 1: Deploy Frontend to Vercel (FREE)

### Deploy Next.js Webapp

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import `FlogIt-Tech` (or `Hero-Exchange`) repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend/webapp`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. Add Environment Variables:
   ```
   NEXTAUTH_SECRET=generate-a-strong-random-string-here
   NEXTAUTH_URL=https://your-vercel-app.vercel.app
   ```
   (Add the rest after Railway is set up)

6. Click "Deploy"

### Deploy Admin Console (Angular)

1. In Vercel, click "Add New Project"
2. Import `FlogIt-Admin` repository
3. Configure:
   - **Framework Preset**: Angular
   - **Root Directory**: `admin-console`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/admin-console/browser`
4. Click "Deploy"

---

## Step 2: Deploy Services to Railway

### Create Each Service

For each service below:
1. Click "+ New" → "GitHub Repo"
2. Select your `Hero-Exchange` (or `FlogIt-Tech`) repo
3. Set **Dockerfile Path** to the path shown below
4. Add the environment variables listed

---

### Identity Service
**Dockerfile Path**: `src/IdentityService/dockerfile`

```env
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:${{PORT}}
ConnectionStrings__DefaultConnection=postgresql://postgres:tEtwsMDEpuDSMAvnxTyjAjVcBrDfZJkz@postgres.railway.internal:5432/railway
ClientApp=https://hero-exchange-dmpir3zyo-dionuptons-projects.vercel.app
ClientSecret=secret
```

---

### Gateway Service
**Dockerfile Path**: `src/GatewayService/dockerfile`

```env
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:${{PORT}}
ClientApp=https://hero-exchange-dmpir3zyo-dionuptons-projects.vercel.app
```

---

### Auction Service
**Dockerfile Path**: `src/AuctionService/dockerfile`

```env
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:${{PORT}}
RabbitMq__Host=hawk.rmq.cloudamqp.com
RabbitMq__Username=nucsvqes
RabbitMq__Password=uvYH19uvOeeNUoSIjgf27XH0ubeqQ7Rs
RabbitMq__VirtualHost=nucsvqes
ConnectionStrings__DefaultConnection=postgresql://postgres:tEtwsMDEpuDSMAvnxTyjAjVcBrDfZJkz@postgres.railway.internal:5432/railway
IdentityServiceUrl=https://YOUR-IDENTITY-SERVICE.railway.app
Kestrel__Endpoints__Grpc__Protocols=Http2
Kestrel__Endpoints__Grpc__Url=http://+:7777
Kestrel__Endpoints__Webapi__Protocols=Http1
Kestrel__Endpoints__Webapi__Url=http://+:${{PORT}}
```

---

### Bidding Service
**Dockerfile Path**: `src/BiddingService/dockerfile`

```env
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:${{PORT}}
RabbitMq__Host=hawk.rmq.cloudamqp.com
RabbitMq__Username=nucsvqes
RabbitMq__Password=uvYH19uvOeeNUoSIjgf27XH0ubeqQ7Rs
RabbitMq__VirtualHost=nucsvqes
ConnectionStrings__BidDbConnection=mongodb://mongo:MKnNCIKJIMspHmbRDXsWtACAxXBjRnsi@mongodb.railway.internal:27017
IdentityServiceUrl=https://YOUR-IDENTITY-SERVICE.railway.app
GrpcAuction=http://YOUR-AUCTION-SERVICE.railway.internal:7777
```

---

### Search Service
**Dockerfile Path**: `src/SearchService/dockerfile`

```env
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:${{PORT}}
RabbitMq__Host=hawk.rmq.cloudamqp.com
RabbitMq__Username=nucsvqes
RabbitMq__Password=uvYH19uvOeeNUoSIjgf27XH0ubeqQ7Rs
RabbitMq__VirtualHost=nucsvqes
ConnectionStrings__MongoDbConnection=mongodb://mongo:MKnNCIKJIMspHmbRDXsWtACAxXBjRnsi@mongodb.railway.internal:27017
AuctionServiceUrl=http://YOUR-AUCTION-SERVICE.railway.internal
```

---

### Notification Service
**Dockerfile Path**: `src/NotificationService/dockerfile`

```env
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:${{PORT}}
RabbitMq__Host=hawk.rmq.cloudamqp.com
RabbitMq__Username=nucsvqes
RabbitMq__Password=uvYH19uvOeeNUoSIjgf27XH0ubeqQ7Rs
RabbitMq__VirtualHost=nucsvqes
ClientApp=https://hero-exchange-dmpir3zyo-dionuptons-projects.vercel.app
AdminApp=https://YOUR-VERCEL-ADMIN.vercel.app
```

---

## Step 3: Update Vercel Environment Variables

Once Railway services are deployed, update Vercel webapp with:

```env
NEXT_PUBLIC_API_URL=https://YOUR-GATEWAY.railway.app
NEXT_PUBLIC_NOTIFY_URL=https://YOUR-GATEWAY.railway.app/notifications
NEXTAUTH_SECRET=generate-a-strong-random-string-here
NEXTAUTH_URL=https://YOUR-VERCEL-WEBAPP.vercel.app
ID_URL=https://YOUR-IDENTITY-SERVICE.railway.app
API_URL=https://YOUR-GATEWAY.railway.app/
CLIENT_SECRET=secret
```

Then trigger a redeploy.

---

## Step 4: Run Python Bots Locally

```bash
cd py-bots
pip install -r requirements.txt

# Create .env file with:
API_BASE=https://YOUR-GATEWAY.railway.app/
IDENTITY_URL=https://YOUR-IDENTITY-SERVICE.railway.app/
BOT_USERS=alice,bob
BOT_PASSWORD=Pass123$

# Run
python -m main
```

---

## Important Notes

### CloudAMQP SSL
CloudAMQP uses `amqps://` (SSL). MassTransit should handle this automatically when you provide the host. If you get SSL errors, you may need to add:
```env
RabbitMq__UseSsl=true
```

### Internal vs External URLs
- Use `.railway.internal` URLs for service-to-service communication within Railway (faster, no egress charges)
- Use public `.railway.app` URLs for external access (Vercel, browsers)

### Replacing Placeholders
Replace these placeholders with your actual Railway URLs:
- `YOUR-VERCEL-WEBAPP` → Your Vercel webapp domain
- `YOUR-VERCEL-ADMIN` → Your Vercel admin console domain
- `YOUR-IDENTITY-SERVICE` → Railway identity service URL
- `YOUR-GATEWAY` → Railway gateway service URL
- `YOUR-AUCTION-SERVICE` → Railway auction service internal name

---

## Troubleshooting

### Service crashes immediately
- Check Railway logs for the specific error
- Ensure all environment variables are set
- CloudAMQP requires `RabbitMq__VirtualHost` to be set to your username

### CORS errors
- Ensure `ClientApp` and `AdminApp` URLs match your Vercel domains exactly
- Include `https://` prefix

### Database connection issues
- Railway internal URLs only work within the same Railway project
- For MongoDB, ensure the URL includes the database name

### RabbitMQ connection refused
- Verify CloudAMQP credentials are correct
- Ensure `RabbitMq__VirtualHost` is set (for free tier, it's your username)
- CloudAMQP free tier has connection limits (3 concurrent connections)

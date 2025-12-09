from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from src.database.connect import Database
from src.api.api_user import router as api_user
from src.api.api_auth import router as api_auth
from src.api.api_memo import router as api_memo
from src.api.api_tab import router as api_tab

from dotenv import load_dotenv
import os
import uvicorn

load_dotenv()

app = FastAPI(
    title="AxionSync API",
    description="AxionSync Backend API",
    version="1.0.0",
    docs_url=None,  # Disable default docs
    redoc_url=None,  # Disable default redoc
)

db_con = Database()

load_dotenv()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_BASE_URL")],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

################################ ตัวจัดการ API Router ################################
# Routers use their own security dependencies (require_bearer, require_api_key)
# The security schemes are registered via the HTTPBearer and APIKeyHeader in api_auth.py
app.include_router(api_user)
app.include_router(api_auth)
app.include_router(api_memo)
app.include_router(api_tab)


####################################################################################


@app.get("/")
def read_root():
    return {"message": "Hello AxionSync API"}


# Custom Swagger UI with Login functionality
@app.get("/docs", include_in_schema=False)
def custom_swagger_ui():
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>AxionSync API - Swagger</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
        <style>
            .custom-toolbar {
                padding: 15px 20px;
                background: #1f2937;
                display: flex;
                gap: 10px;
                align-items: center;
                flex-wrap: wrap;
            }
            .custom-toolbar input {
                padding: 8px 12px;
                border-radius: 6px;
                border: 1px solid #374151;
                background: #374151;
                color: white;
                font-size: 14px;
            }
            .custom-toolbar input::placeholder {
                color: #9ca3af;
            }
            .custom-toolbar button {
                padding: 8px 16px;
                border-radius: 6px;
                border: none;
                cursor: pointer;
                font-weight: 500;
                font-size: 14px;
                transition: opacity 0.2s;
            }
            .custom-toolbar button:hover {
                opacity: 0.9;
            }
            .btn-login {
                background: #22c55e;
                color: white;
            }
            .btn-clear {
                background: #ef4444;
                color: white;
            }
            .btn-api-key {
                background: #3b82f6;
                color: white;
            }
            .status-text {
                color: #9ca3af;
                font-size: 13px;
                margin-left: 10px;
            }
            .status-text.success {
                color: #22c55e;
            }
            .status-text.error {
                color: #ef4444;
            }
            .section-label {
                color: #9ca3af;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
            }
            .divider {
                width: 1px;
                height: 30px;
                background: #374151;
                margin: 0 10px;
            }
        </style>
    </head>
    <body>
        <div class="custom-toolbar">
            <!-- API Key Section -->
            <span class="section-label">API Key:</span>
            <input type="password" id="apiKeyInput" placeholder="Enter API Key" style="width: 150px; paddingRight:">
            <button class="btn-api-key" onclick="setApiKey()">🔑 Set API Key</button>
            
            <div class="divider"></div>
            
            <!-- Login Section -->
            <span class="section-label">Login:</span>
            <input type="text" id="usernameInput" placeholder="Username" style="width: 120px;">
            <input type="password" id="passwordInput" placeholder="Password" style="width: 120px;">
            <button class="btn-login" onclick="loginAndSetToken()">🔐 Login & Get Token</button>
            
            <div class="divider"></div>
            
            <button class="btn-clear" onclick="clearAll()">❌ Clear All</button>
            
            <span id="statusText" class="status-text"></span>
        </div>

        <div id="swagger-ui"></div>

        <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
        <script>
            const ui = SwaggerUIBundle({
                url: "/openapi.json",
                dom_id: '#swagger-ui',
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIBundle.SwaggerUIStandalonePreset
                ],
                layout: "BaseLayout",
            });

            function showStatus(message, isError = false) {
                const statusEl = document.getElementById('statusText');
                statusEl.textContent = message;
                statusEl.className = 'status-text ' + (isError ? 'error' : 'success');
                setTimeout(() => { statusEl.textContent = ''; }, 5000);
            }

            window.setApiKey = function() {
                const apiKey = document.getElementById('apiKeyInput').value.trim();
                if (!apiKey) {
                    showStatus('❌ Please enter an API key', true);
                    return;
                }
                
                ui.authActions.authorize({
                    apiKey: {
                        name: "apiKey",
                        schema: {
                            type: "apiKey",
                            in: "header",
                            name: "X-API-KEY"
                        },
                        value: apiKey
                    }
                });
                showStatus('✅ API Key set!');
            }

            window.loginAndSetToken = async function() {
                const apiKey = document.getElementById('apiKeyInput').value.trim();
                const username = document.getElementById('usernameInput').value.trim();
                const password = document.getElementById('passwordInput').value.trim();

                if (!apiKey) {
                    showStatus('❌ Please set API Key first', true);
                    return;
                }
                if (!username || !password) {
                    showStatus('❌ Please enter username and password', true);
                    return;
                }

                try {
                    const response = await fetch('/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-API-KEY': apiKey
                        },
                        body: JSON.stringify({ username, password })
                    });

                    const data = await response.json();

                    if (data.success && data.token) {
                        // Set Bearer token in Swagger
                        ui.authActions.authorize({
                            bearerAuth: {
                                name: "bearerAuth",
                                schema: {
                                    type: "http",
                                    scheme: "bearer"
                                },
                                value: data.token
                            }
                        });
                        showStatus('✅ Logged in! Token set automatically');
                    } else {
                        showStatus('❌ Login failed: ' + (data.message || 'Invalid credentials'), true);
                    }
                } catch (error) {
                    showStatus('❌ Login error: ' + error.message, true);
                }
            }

            window.clearAll = function() {
                ui.authActions.logout(["apiKey"]);
                ui.authActions.logout(["bearerAuth"]);
                document.getElementById('apiKeyInput').value = '';
                document.getElementById('usernameInput').value = '';
                document.getElementById('passwordInput').value = '';
                showStatus('✅ All cleared!');
            }
        </script>
    </body>
    </html>
    """
    return HTMLResponse(html)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=80, reload=True)

INSERT INTO "public"."api_settings" ("id", "setting_key", "setting_value", "enabled", "created_at", "updated_at") VALUES
	('15c1dd9b-a6d9-46e4-9d64-a61be9348f8f', 'carwale_api', '{"apiKey": "", "baseUrl": "https://api.carwale.com/v1", "endpoints": {"cars": "/cars", "brands": "/brands", "images": "/cars/{id}/images", "search": "/cars/search", "pricing": "/cars/{id}/pricing", "variants": "/cars/{id}/variants", "carDetails": "/cars/{id}"}, "syncInterval": "daily"}', false, '2025-07-31 05:07:37.504069+00', '2025-07-31 05:07:37.504069+00'),
	('c104712f-5d3e-42e6-b278-8df6011d5c4d', 'brand_apis', '{"apis": [{"brand": "Maruti Suzuki", "apiKey": "", "method": "POST", "enabled": false, "headers": {}, "endpoint": ""}, {"brand": "Hyundai", "apiKey": "", "method": "POST", "enabled": false, "headers": {}, "endpoint": ""}, {"brand": "Tata", "apiKey": "", "method": "POST", "enabled": false, "headers": {}, "endpoint": ""}]}', false, '2025-07-31 05:07:37.504069+00', '2025-07-31 05:07:37.504069+00'),
	('dcafe076-d9a3-44fe-b006-18889172d2b9', 'general_settings', '{"sendDelay": 5, "logApiCalls": true, "autoSendToAPI": true, "retryAttempts": 3, "enableWebhooks": true}', true, '2025-07-31 05:07:37.504069+00', '2025-07-31 05:07:37.504069+00');


--
-- Data for Name: auth_audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--


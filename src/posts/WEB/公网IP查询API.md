---
title: "公网IP查询API"
date: 2025-06-10
description: "1. api.ipify.org"
tags: []
categories: ["${folder}"]
---

## ipv4

 1. **`api.ipify.org`**
	- **URL**: <https://api.ipify.org> / <https://api4.ipify.org> / <https://api64.ipify.org> 
	- **返回格式**: 支持纯文本、JSON、XML 等多种格式，通过 `format=json` 参数指定格式。
	- **特点**:  
	  - 无速率限制，适合高频次调用。  
	  - 长期稳定，被多个开源项目和开发者推荐。  

 2.  **`checkip.amazonaws.com`**
	 - **URL**: <https://checkip.amazonaws.com> 
	 - **返回格式**: 纯文本  
	 - **特点**:  
	   - 亚马逊 AWS 提供的服务，稳定性极高。  
	   - 适合追求简单性和可靠性的场景。
	
 3.  **`api-ipv4.ip.sb/ip`**
	 - **URL**: <https://api-ipv4.ip.sb/ip> 
	 - **返回格式**: 纯文本  
	 - **特点**:  
	   - 阿里云旗下的 Cloudflare CDN 提供的查询接口，稳定性极高。
	   - 适合国内使用场景。


## ipv6

1. **`api6.ipify.org`**  
   - **URL**: <https://api6.ipify.org>
   - **返回格式**: 支持纯文本、JSON、XML 等多种格式，通过 `format=json` 参数指定格式。
   - **特点**:  
	  - 无速率限制，适合高频次调用。  
	  - 长期稳定，被多个开源项目和开发者推荐。  

2. **`v6.ident.me`**  
   - **URL**: <https://v6.ident.me>
   - **返回格式**: 纯文本 
   - **特点**：
	   - 同时支持ipv4和ipv6，也支持http和https。
	   - 运行情况较稳定，社区使用广泛。
	   - 注：可能依赖个人或小团队维护，不保证长期 SLA。  
   
3. **`api-ipv6.ip.sb`**  
   - **URL**: <https://api-ipv6.ip.sb/ip>
   - **返回格式**: 纯文本 
   - **特点**：
	   - 阿里云旗下的 Cloudflare CDN 提供的查询接口，稳定性极高。
	   - 适合国内使用场景。

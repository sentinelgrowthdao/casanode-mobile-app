
import {
	type NetworkStatus,
	type NetworkConfiguration,
	type CertificateInfo,
	type NodeStatus,
	type NetworkInstallationCheck,
	type NetworkInstallDocker,
	type NetworkInstallConfiguration,
	type NodeConfigResults,
} from '@interfaces/network';

class ApiService
{
	private static instance: ApiService;
	private authToken: string | null = null;
	private baseUrl: string | null = null;
	private connected = false;
	
	private constructor() {}
	
	public static getInstance(): ApiService
	{
		if (!ApiService.instance)
			ApiService.instance = new ApiService();
		
		return ApiService.instance;
	}
	
	/**
	 * Initialize the service with token, ip, and port
	 * @param ip string
	 * @param port number
	 * @param token string
	 * @returns boolean
	 */
	public connect(ip: string, port: number, token: string): boolean
	{
		this.authToken = token;
		this.baseUrl = `https://${ip}:${port}/api/v1`;
		this.connected = true;
		return true;
	}
	
	/**
	 * Disconnect from the BLE server.
	 * @returns void
	 */
	public async disconnect(): Promise<void>
	{
		this.authToken = null;
		this.baseUrl = null;
		this.connected = false;
	}
	
	/**
	 * Check if the device is connected to the BLE server.
	 * @returns boolean
	 */
	public isConnected(): boolean
	{
		return this.connected;
	}
	
	/**
	 * Helper method to get authorization headers
	 */
	private getHeaders(): HeadersInit
	{
		return {
			"Authorization": `Bearer ${this.authToken}`,
			"Content-Type": "application/json",
		};
	}
	
	/**
	 * Send GET request
	 * @param endpoint string
	 * @returns Promise<any>
	 */
	private async getRequest(endpoint: string): Promise<any>
	{
		try
		{
			if (!this.baseUrl || !this.authToken)
				throw new Error("API is not initialized. Please set token and baseUrl.");
			
			const response = await fetch(`${this.baseUrl}${endpoint}`, {
				method: "GET",
				headers: this.getHeaders(),
			});
			return await this.handleResponse(response);
		}
		catch (error)
		{
			console.error(`GET request failed: ${error}`);
			return null;
		}
	}
	
	/**
	 * Send POST request
	 * @param endpoint string
	 * @param data any
	 */
	private async postRequest(endpoint: string, data?: any): Promise<any>
	{
		try
		{
			if (!this.baseUrl || !this.authToken)
				throw new Error("API is not initialized. Please set token and baseUrl.");
			
			const response = await fetch(`${this.baseUrl}${endpoint}`, {
				method: "POST",
				headers: this.getHeaders(),
				body: JSON.stringify(data),
			});
			
			return await this.handleResponse(response);
		}
		catch (error)
		{
			console.error(`POST request failed: ${error}`);
			return null;
		}
	}
	
	/**
	 * Send PUT request
	 * @param endpoint string
	 * @param data any
	 */
	private async putRequest(endpoint: string, data?: any): Promise<any>
	{
		try
		{
			if (!this.baseUrl || !this.authToken)
				throw new Error("API is not initialized. Please set token and baseUrl.");
			
			const response = await fetch(`${this.baseUrl}${endpoint}`, {
				method: "PUT",
				headers: this.getHeaders(),
				body: JSON.stringify(data),
			});
			
			return await this.handleResponse(response);
		}
		catch (error)
		{
			console.error(`PUT request failed: ${error}`);
			return null;
		}
	}
	
	/**
	 * Send DELETE request
	 * @param endpoint string
	 * @returns Promise<any>
	 */
	private async deleteRequest(endpoint: string): Promise<any>
	{
		try
		{
			if (!this.baseUrl || !this.authToken)
			{
				throw new Error("API is not initialized. Please set token and baseUrl.");
			}
			const response = await fetch(`${this.baseUrl}${endpoint}`, {
				method: "DELETE",
				headers: this.getHeaders(),
			});
			return await this.handleResponse(response);
		}
		catch(error)
		{
			console.error(`DELETE request failed: ${error}`);
			return null;
		}
	}
	
	/**
	 * Helper method to handle responses
	 * @param response Response
	 * @returns Promise<any>
	 */
	private async handleResponse(response: Response): Promise<any>
	{
		if (!response.ok)
		{
			const error = await response.text();
			throw new Error(`API request failed: ${error}`);
		}
		return await response.json();
	}
	
	/**
	 * Get the node status
	 * @returns Promise<string>
	 */
	public async getNodeStatus(): Promise<string>
	{
		// Get the node status
		const data = await this.getRequest("/node/status");
		return data.status ?? 'unknown';
	}
	
	/**
	 * Get the node status
	 * @returns Promise<NetworkStatus>
	 */
	public async getStatus(): Promise<NetworkStatus>
	{
		// Get the node status
		const data = await this.getRequest("/status");
		
		// Get the node status
		const status : NodeStatus =
		{
			type: data.status.type ?? null,
			version: data.status.version ?? null,
			bandwidth: {
				download: data.status.bandwidth.download ?? null,
				upload: data.status.bandwidth.upload ?? null,
			},
			handshake: {
				enable: data.status.handshake.enable ?? null,
				peers: data.status.handshake.peers ?? null,
			},
			location: {
				city: data.status.location.city ?? null,
				country: data.status.location.country ?? null,
				latitude: data.status.location.latitude ?? null,
				longitude: data.status.location.longitude ?? null,
			},
			peers: data.status.peers ?? null,
			max_peers: data.status.max_peers ?? null,
		};
		
		// Get the certificate information
		const certificate : CertificateInfo =
		{
			creationDate: data.certificate.creationDate ?? null,
			expirationDate: data.certificate.expirationDate ?? null,
			issuer: data.certificate.issuer ?? null,
			subject: data.certificate.subject ?? null,
		};
		
		// Return the node status
		return {
			version: data.version ?? null,
			uptime: data.uptime ?? null,
			nodeLocation: data.nodeLocation ?? null,
			systemArch: data.systemArch ?? null,
			systemKernel: data.systemKernel ?? null,
			systemOs: data.systemOs ?? null,
			status: status,
			certificate: certificate,
		} as NetworkStatus;
	}
	
	/**
	 * Get the node configuration
	 * @returns Promise<NetworkConfiguration>
	 */
	public async getNodeConfiguration(): Promise<NetworkConfiguration>
	{
		// Get the node configuration
		const data = await this.getRequest("/node/configuration");
		
		// Return the node configuration
		return {
			moniker: data.moniker ?? null,
			backend: data.backend ?? null,
			nodeType: data.nodeType ?? null,
			nodeIp: data.nodeIp ?? null,
			nodePort: data.nodePort ?? null,
			vpnType: data.vpnType ?? null,
			vpnPort: data.vpnPort ?? null,
			maximumPeers: data.maximumPeers ?? null,
			dockerImage: data.dockerImage ?? null,
		} as NetworkConfiguration;
	}
	
	/**
	 * Set the node configuration
	 * @param config NetworkConfiguration
	 * @returns Promise<NodeConfigResults>
	 */
	public async setNodeConfiguration(config: NetworkConfiguration): Promise<NodeConfigResults>
	{
		const data = await this.postRequest("/node/configuration", config);
		const results: NodeConfigResults = {};
		
		Object.keys(config).forEach((key) =>
		{
			results[key] = data.success ?? false;
		});
		
		return results;
	}
	
	/**
	 * Get the node address
	 * @returns Promise<string|null>
	 */
	public async getNodeAddress(): Promise<string|null>
	{
		// Get the node address
		const data = await this.getRequest("/node/address");
		
		// Return the node address
		return data.address ?? null;
	}
	
	/**
	 * Get the wallet address
	 * @returns Promise<string|null>
	 */
	public async getWalletAddress(): Promise<string|null>
	{
		// Get the wallet address
		const data = await this.getRequest("/wallet/address");
		
		// Return the wallet address
		return data.address ?? null;
	}
	
	/**
	 * Get the node balance
	 * @returns Promise<string|null>
	 */
	public async getNodeBalance(): Promise<string|null>
	{
		// Get the node balance
		const data = await this.getRequest("/node/balance");
		return data.balance ?? null;
	}
	
	/**
	 * Check the network installation
	 * @returns Promise<NetworkInstallationCheck>
	 */
	public async checkInstallation(): Promise<NetworkInstallationCheck>
	{
		// Get the installation check
		const data = await this.getRequest("/check/installation");
		
		// Return the installation check
		return {
			image: data.image ?? false,
			containerExists: data.containerExists ?? false,
			nodeConfig: data.nodeConfig ?? false,
			vpnConfig: data.vpnConfig ?? false,
			certificateKey: data.certificateKey ?? false,
			wallet: data.wallet ?? false,
		};
	}
	
	/**
	 * Install the Docker image
	 * @returns Promise<NetworkInstallDocker>
	 */
	public async installDockerImage(): Promise<NetworkInstallDocker>
	{
		// Install the Docker image
		const data = await this.postRequest("/install/docker-image");
		
		// Return the installation status
		return {
			imagePull: data.imagePull ?? null,
		};
	}
	
	/**
	 * Create the node configuration
	 * @returns Promise<NetworkInstallConfiguration>
	 */
	public async installNodeConfiguration(): Promise<NetworkInstallConfiguration>
	{
		// Install the node configuration
		const data = await this.postRequest("/install/configuration");
		
		// Return the installation status
		return {
			nodeConfig: data.nodeConfig ?? false,
			vpnConfig: data.vpnConfig ?? false,
			certificate: data.certificate ?? false,
		};
	}
	
	/**
	 * Set the node passphrase
	 * @param passphrase string
	 * @returns Promise<boolean>
	 */
	public async setPassphrase(passphrase: string): Promise<boolean>
	{
		const data = await this.postRequest("/node/passphrase", { passphrase });
		return data.success ?? false;
	}
	
	/**
	 * Check if the node passphrase is available
	 * @returns Promise<boolean>
	 */
	public async nodePassphrase(): Promise<boolean>
	{
		// Get the passphrase availability and return the result
		const data = await this.getRequest("/node/passphrase");
		return data.available ?? false;
	}
	
	/**
	 * Start the node
	 * @returns Promise<boolean>
	 */
	public async startNode(): Promise<boolean>
	{
		const data = await this.putRequest("/node/start");
		return data.start ?? false;
	}
	
	/**
	 * Stop the node
	 * @returns Promise<boolean>
	 */
	public async stopNode(): Promise<boolean>
	{
		const data = await this.putRequest("/node/stop");
		return data.stop ?? false;
	}
	
	/**
	 * Restart the node
	 * @returns Promise<boolean>
	 */
	public async restartNode(): Promise<boolean>
	{
		const data = await this.putRequest("/node/restart");
		return data.restart ?? false;
	}
	
	/**
	 * Renew the certificate
	 * @returns Promise<boolean>
	 */
	public async renewCertificate(): Promise<boolean>
	{
		const data = await this.postRequest("/certificate/renew");
		return data.renew ?? false;
	}
	
	/**
	 * Update the system
	 * @returns Promise<boolean>
	 */
	public async updateSystem(target: "system" | "sentinel"): Promise<boolean>
	{
		const data = await this.postRequest("/system/update", { target });
		return data.success ?? false;
	}
	
	/**
	 * Reboot the system
	 * @returns Promise<boolean>
	 */
	public async rebootSystem(): Promise<boolean>
	{
		const data = await this.postRequest("/system/reboot");
		return data.success ?? false;
	}
	
	/**
	 * Shutdown the system
	 * @returns Promise<boolean>
	 */
	public async shutdownSystem(): Promise<boolean>
	{
		const data = await this.postRequest("/system/shutdown");
		return data.success ?? false;
	}
	
	/**
	 * Reset the system
	 * @returns Promise<boolean>
	 */
	public async resetSystem(): Promise<boolean>
	{
		const data = await this.postRequest("/system/reset");
		return data.success ?? false;
	}
	
	
	/**
	 * Create a new wallet
	 * @returns Promise<string|null>
	 */
	public async createWallet(): Promise<string|null>
	{
		const data = await this.postRequest("/wallet/create");
		return data.mnemonic ?? null;
	}
	
	/**
	 * Restore the wallet
	 * @param mnemonic string
	 * @returns Promise<boolean>
	 */
	public async restoreWallet(mnemonic: string): Promise<boolean>
	{
		const data = await this.postRequest("/wallet/restore", { mnemonic: mnemonic });
		return data.success ?? false;
	}
	
	/**
	 * Remove the wallet
	 * @returns Promise<boolean>
	 */
	public async removeWallet(): Promise<boolean>
	{
		const data = await this.deleteRequest("/wallet/remove");
		return data.success ?? false;
	}
	
	/**
	 * Get the status of the port
	 * @param portType: 'node' | 'vpn'
	 * @returns Promise<string|null>
	 */
	public async checkPort(portType: 'node' | 'vpn'): Promise<string|null>
	{
		const data = await this.getRequest(`/check/port/${portType}`);
		const status = data.status ?? -1;
		// Return the status
		return status === '2' ? 'open' : status === '3' ? 'closed' : null;
	}






	
	
	
	
	
}

export default ApiService.getInstance();

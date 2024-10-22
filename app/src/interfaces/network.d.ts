
export interface NodeStatus
{
	type: number | null;
	version: string | null;
	bandwidth:
	{
		download: string | null;
		upload: string | null;
	},
	handshake:
	{
		enable: boolean | null;
		peers: number | null;
	},
	location:
	{
		city: string | null;
		country: string | null;
		latitude: number | null;
		longitude: number | null;
	},
	peers: number | null;
	max_peers: number | null;
}

export interface CertificateInfo
{
	creationDate: string | null;
	expirationDate: string | null;
	issuer: string | null;
	subject: string | null;
}

export interface NetworkStatus
{
	version: string | null;
	uptime: number | null;
	nodeLocation: string | null;
	systemArch: string | null;
	systemKernel: string | null;
	systemOs: string | null;
	status: NodeStatus | null;
	certificate: CertificateInfo | null;
}

export interface NetworkNodeStatus
{
	status: string | null;
}

export interface NetworkConfiguration
{
	moniker: string | null;
	backend: string | null;
	nodeType: string | null;
	nodeIp: string | null;
	nodePort: number | null;
	vpnType: string | null;
	vpnPort: number | null;
	maximumPeers: number | null;
	dockerImage: string | null;
}

export interface NetworkInstallationCheck
{
	image: boolean;
	containerExists: boolean;
	nodeConfig: boolean;
	vpnConfig: boolean;
	certificateKey: boolean;
	wallet: boolean;
}

export interface NetworkInstallDocker
{
	imagePull: boolean;
}

export interface NetworkInstallConfiguration
{
	nodeConfig: boolean;
	vpnConfig: boolean;
	certificate: boolean;
}

export interface NodeConfigResults
{
	[key: string]: boolean;
}

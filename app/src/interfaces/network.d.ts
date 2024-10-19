
export interface NodeStatus
{
	type: number;
	version: string;
	bandwidth:
	{
		download: number;
		upload: number;
	},
	handshake:
	{
		enable: boolean;
		peers: number;
	},
	location:
	{
		city: string;
		country: string;
		latitude: number;
		longitude: number;
	},
	peers: number;
	max_peers: number;
}

export interface CertificateInfo
{
	creationDate: string;
	expirationDate: string;
	issuer: string;
	subject: string;
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

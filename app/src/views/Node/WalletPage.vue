<script lang="ts" setup>
import {
	IonPage, IonContent, IonHeader,
	IonCard, IonCardHeader, IonCardTitle, IonCardContent,
	IonButton, IonIcon, IonGrid, IonRow, IonCol, IonItem, IonLabel
} from '@ionic/vue';
import { computed } from 'vue';
import { refresh, link, copy } from 'ionicons/icons';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import AppToolbar from '@/components/AppToolbar.vue';
import BluetoothService from '@/services/BluetoothService';
import { copyToClipboard } from '@/utils/clipboard';
import { useNodeStore } from '@stores/NodeStore';

// Import the useI18n composable function.
const { t, locale } = useI18n();

// Router
const router = useRouter();
// Import the useNodeStore composable function.
const nodeStore = useNodeStore();

/**
 * Format the amount of the node balance.
 */
const formattedAmount = computed(() =>
{
	return formatNumber(nodeStore.nodeBalance.amount, locale.value);
});

/**
 * Format the number with the locale.
 * @param amount
 * @param locale
 * @returns string
 */
function formatNumber(amount: number, locale: string): string
{
	return new Intl.NumberFormat(locale).format(amount);
}

/**
 * Update the wallet balance.
 */
const updateWalletBalance = async () =>
{
	// Get the node balance
	const nodeBalance = await BluetoothService.readNodeBalance();
	nodeStore.setNodeBalance(nodeBalance);
};

/**
 * Remove the wallet.
 */
const removeWallet = async () =>
{
	// Remove the wallet
	const success = await BluetoothService.performWalletAction('remove');
	// Check if the wallet was removed
	if (success)
	{
		// Go back to the home page
		router.replace({ name: 'Home' });
	}
};

</script>
<template>
	<ion-page>
		<ion-header>
			<app-toolbar />
		</ion-header>
		<ion-content>
			<div class="wallet">
				<!-- Node Balance -->
				<ion-card class="container header bg-blue">
					<ion-card-content>
						<ion-grid>
							<ion-row>
								<ion-col size="9">
									<p class="label">{{ $t('wallet.node-balance-label') }}</p>
									<p class="amount">{{ formattedAmount }}<span class="unit">{{ nodeStore.nodeBalance.denom }}</span></p>
								</ion-col>
								<ion-col size="3" class="ion-text-right">
									<ion-button fill="clear" size="large" class="refresh-button" @click="updateWalletBalance">
										<ion-icon :icon="refresh" size="large"
											aria-label="{{ $t('wallet.balance-refresh') }}" />
									</ion-button>
								</ion-col>
							</ion-row>
						</ion-grid>
					</ion-card-content>
				</ion-card>

				<!-- Public and Node Address -->
				<ion-card class="container addresses">
					<ion-card-content>
						<ion-button class="item" fill="clear"
							@click="copyToClipboard(t('wallet.clipboard-address'), nodeStore.publicAddress)">
							<div class=" content">
								<p class="label">
									{{ $t('wallet.public-address-label') }}<ion-icon :icon="copy" class="icon-right" />
								</p>
								<p class="value">{{ nodeStore.publicAddress }}</p>
							</div>
						</ion-button>
						<ion-button class="item" fill="clear"
							@click="copyToClipboard(t('wallet.clipboard-address'), nodeStore.nodeAddress)">
							<div class="content">
								<p class="label">
									{{ $t('wallet.node-address-label') }}<ion-icon :icon="copy" class="icon-right" />
								</p>
								<p class="value">{{ nodeStore.nodeAddress }}</p>
							</div>
						</ion-button>
					</ion-card-content>
				</ion-card>

				<!-- Latest Transactions -->
				<ion-card class="container list" v-if="nodeStore.transactions.length > 0">
					<ion-card-header>
						<ion-card-title>{{ $t('wallet.latest-transactions-label') }}</ion-card-title>
					</ion-card-header>
					<ion-card-content>
						<ion-item v-for="(transaction, index) in nodeStore.transactions" :key="index"
							class="transaction">
							<ion-label>
								<div class="first-line">
									<p class="type">{{ $t(`wallet.${transaction.type}-label`) }}</p>
									<p class="amount">{{ transaction.amount }}</p>
								</div>
								<ion-button class="hash" fill="clear" expand="full">
									{{ transaction.hash }}
									<ion-icon :icon="link"></ion-icon>
								</ion-button>
							</ion-label>
						</ion-item>
					</ion-card-content>
				</ion-card>

				<!-- Delete Wallet -->
				<ion-card class="container nobg">
					<ion-card-content>
						<ion-button color="danger" fill="outline" expand="block" @click="removeWallet">
							{{ $t('wallet.delete-wallet-label') }}
						</ion-button>
					</ion-card-content>
				</ion-card>
			</div>
		</ion-content>
	</ion-page>
</template>

<style lang="scss" scoped>
@import "@scss/container.scss";


.container
{
	&.header
	{
		&>ion-card-content>ion-grid>ion-row>ion-col
		{
			&>.label
			{
				font-size: 0.8rem;
				color: var(--ion-text-color);
			}

			&>.amount
			{
				font-size: 1.8rem;
				line-height: 1.8rem;
				color: var(--ion-text-color);

				&>.unit
				{
					display: block;
					font-size: 0.8rem;
				}
			}

			&>.refresh-button
			{
				--color: var(--ion-text-color);
			}
		}
	}

	&.addresses
	{

		.item
		{
			display: flex;
			justify-content: flex-start;
			align-items: flex-start;
			--padding: 0;
			--padding-start: 0;
			--padding-end: 0;
			--padding-top: 0;
			--padding-bottom: 0;

			&>.content
			{
				display: flex;
				flex-direction: column;
				align-items: flex-start;
				width: 100%;
				gap: 0.5rem;

				&>.label
				{
					display: flex;
					margin: 0;
					width: 100%;
					align-items: flex-start;
					font-size: 1.2rem;
					color: var(--container-label-color);

					&>ion-icon
					{
						margin-left: auto;
						--color: var(--ion-text-color);
					}
				}

				&>.value
				{
					margin: 0;
					width: 100%;
					font-size: 0.9rem;
					color: var(--ion-text-color);
					text-overflow: ellipsis;
					white-space: nowrap;
					overflow: hidden;
				}
			}
		}
	}
}

.transaction
{
	display: flex;
	flex-direction: column;
	--padding-start: 0;
	--inner-padding-end: 0;
	--background: transparent;

	ion-label
	{
		&>.first-line
		{
			display: flex;
			justify-content: space-between;
			width: 100%;

			&>.type
			{
				padding: 0.25rem 0.55rem;
				border-radius: 0.25rem;
				color: var(--ion-text-color);
				background: var(--app-background-color-secondary);
			}

			&>.amount
			{
				color: var(--ion-text-color);
				text-align: right;
			}
		}

		&>.hash
		{
			--padding-start: 0;
			--padding-end: 0;
			color: var(--container-label-color);
			align-self: flex-start;
			margin-top: 5px;
			text-overflow: ellipsis;
			white-space: nowrap;
			overflow: hidden;
			width: 100%;

			&>ion-icon
			{
				margin-left: auto;
			}
		}
	}
}
</style>

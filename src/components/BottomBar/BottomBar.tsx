import React, { memo, useMemo, useCallback } from "react"
import { Text, View, Pressable, useWindowDimensions } from "react-native"
import storage from "../../lib/storage"
import { useMMKVBoolean, useMMKVString, useMMKVNumber } from "react-native-mmkv"
import { SheetManager } from "react-native-actions-sheet"
import { useStore, navigationAnimation } from "../../lib/state"
import Ionicon from "@expo/vector-icons/Ionicons"
import { i18n } from "../../i18n"
import { getParent, getRouteURL } from "../../lib/helpers"
import { CommonActions } from "@react-navigation/native"
import { getColor } from "../../style/colors"
import useNetworkInfo from "../../lib/services/isOnline/useNetworkInfo"
import useDarkMode from "../../lib/hooks/useDarkMode"
import useLang from "../../lib/hooks/useLang"
import { NavigationContainerRef } from "@react-navigation/native"

export interface BottomBarProps {
	navigation: NavigationContainerRef<ReactNavigation.RootParamList>
}

export const BottomBar = memo(({ navigation }: BottomBarProps) => {
	const darkMode = useDarkMode()
	const currentRoutes = useStore(state => state.currentRoutes)
	const lang = useLang()
	const setBottomBarHeight = useStore(state => state.setBottomBarHeight)
	const [userId] = useMMKVNumber("userId", storage)
	const [defaultDriveOnly] = useMMKVBoolean("defaultDriveOnly:" + userId, storage)
	const [defaultDriveUUID] = useMMKVString("defaultDriveUUID:" + userId, storage)
	const dimensions = useWindowDimensions()
	const networkInfo = useNetworkInfo()

	const iconTextMaxWidth: number = useMemo(() => {
		return dimensions.width / 5 - 25
	}, [dimensions])

	const [showHome, showCloud, canOpenBottomAddActionSheet, isPhotosScreen, showSettings, isNotesScreen, isChatsScreen, isContactsScreen] =
		useMemo(() => {
			const parent = getParent()
			const routeURL = getRouteURL()
			const baseName = defaultDriveOnly && defaultDriveUUID ? defaultDriveUUID : "base"

			let currentScreenName = "MainScreen"
			let isRecentsScreen = false
			let isTrashScreen = false
			let isSharedScreen = false
			let isPhotosScreen = false
			let isFavoritesScreen = false
			let isBaseScreen = false
			let isOfflineScreen = false
			let isNotesScreen = false
			let isChatsScreen = false
			let isContactsScreen = false

			if (typeof currentRoutes === "object") {
				if (currentRoutes.length > 0) {
					const currentRoute = currentRoutes[currentRoutes.length - 1]

					currentScreenName = currentRoute.name

					isRecentsScreen = routeURL.indexOf("recents") !== -1
					isTrashScreen = routeURL.indexOf("trash") !== -1
					isPhotosScreen = routeURL.indexOf("photos") !== -1
					isFavoritesScreen = routeURL.indexOf("favorites") !== -1
					isSharedScreen =
						routeURL.indexOf("shared-in") !== -1 || routeURL.indexOf("shared-out") !== -1 || routeURL.indexOf("links") !== -1
					isBaseScreen = routeURL.indexOf(baseName) !== -1
					isOfflineScreen = routeURL.indexOf("offline") !== -1
					isNotesScreen = currentScreenName.indexOf("Note") !== -1
					isChatsScreen = currentScreenName.indexOf("Chat") !== -1
					isContactsScreen = currentScreenName.indexOf("Contact") !== -1
				}
			}

			const canOpenBottomAddActionSheet =
				currentScreenName === "MainScreen" &&
				!isOfflineScreen &&
				!isTrashScreen &&
				!isFavoritesScreen &&
				!isPhotosScreen &&
				!isRecentsScreen &&
				!isNotesScreen &&
				!isChatsScreen &&
				!isContactsScreen &&
				routeURL.indexOf("shared-in") === -1 &&
				parent !== "shared-out" &&
				parent !== "links"

			const showCloud =
				isBaseScreen &&
				!isRecentsScreen &&
				!isTrashScreen &&
				!isSharedScreen &&
				!isNotesScreen &&
				!isChatsScreen &&
				currentScreenName !== "SettingsAccountScreen" &&
				currentScreenName !== "LanguageScreen" &&
				currentScreenName !== "SettingsAdvancedScreen" &&
				currentScreenName !== "CameraUploadScreen" &&
				currentScreenName !== "CameraUploadAlbumsScreen" &&
				currentScreenName !== "SettingsScreen" &&
				currentScreenName !== "TransfersScreen" &&
				currentScreenName !== "EventsScreen" &&
				currentScreenName !== "EventsInfoScreen" &&
				currentScreenName !== "GDPRScreen" &&
				currentScreenName !== "InviteScreen" &&
				currentScreenName !== "TwoFactorScreen" &&
				currentScreenName !== "ChangeEmailPasswordScreen"

			const showSettings =
				currentScreenName === "SettingsScreen" ||
				currentScreenName === "LanguageScreen" ||
				currentScreenName === "SettingsAccountScreen" ||
				currentScreenName === "SettingsAdvancedScreen" ||
				currentScreenName === "CameraUploadScreen" ||
				currentScreenName === "CameraUploadAlbumsScreen" ||
				currentScreenName === "EventsScreen" ||
				currentScreenName === "EventsInfoScreen" ||
				isTrashScreen ||
				currentScreenName === "GDPRScreen" ||
				currentScreenName === "InviteScreen" ||
				currentScreenName === "TwoFactorScreen" ||
				currentScreenName === "ChangeEmailPasswordScreen"

			const showHome = isSharedScreen || isRecentsScreen || isFavoritesScreen || isOfflineScreen

			return [
				showHome,
				showCloud,
				canOpenBottomAddActionSheet,
				isPhotosScreen,
				showSettings,
				isNotesScreen,
				isChatsScreen,
				isContactsScreen
			]
		}, [getParent(), getRouteURL()])

	const navTo = useCallback(
		async (to: "recents" | "cloud" | "photos" | "settings" | "notes" | "chats" | "contacts") => {
			await navigationAnimation({ enable: false })

			if (to === "recents") {
				navigation.dispatch(
					CommonActions.reset({
						index: 0,
						routes: [
							{
								name: "MainScreen",
								params: {
									parent: storage.getBoolean("hideRecents:" + userId) ? "shared-in" : "recents"
								}
							}
						]
					})
				)
			} else if (to === "photos") {
				navigation.dispatch(
					CommonActions.reset({
						index: 0,
						routes: [
							{
								name: "MainScreen",
								params: {
									parent: "photos"
								}
							}
						]
					})
				)
			} else if (to === "contacts") {
				navigation.dispatch(
					CommonActions.reset({
						index: 0,
						routes: [
							{
								name: "ContactsScreen"
							}
						]
					})
				)
			} else if (to === "notes") {
				navigation.dispatch(
					CommonActions.reset({
						index: 0,
						routes: [
							{
								name: "NotesScreen"
							}
						]
					})
				)
			} else if (to === "chats") {
				navigation.dispatch(
					CommonActions.reset({
						index: 0,
						routes: [
							{
								name: "ChatsScreen"
							}
						]
					})
				)
			} else if (to === "settings") {
				navigation.dispatch(
					CommonActions.reset({
						index: 0,
						routes: [
							{
								name: "SettingsScreen"
							}
						]
					})
				)
			} else {
				navigation.dispatch(
					CommonActions.reset({
						index: 0,
						routes: [
							{
								name: "MainScreen",
								params: {
									parent: defaultDriveOnly && defaultDriveUUID ? defaultDriveUUID : "base"
								}
							}
						]
					})
				)
			}
		},
		[defaultDriveOnly, defaultDriveUUID, userId]
	)

	const openAddSheet = useCallback(() => {
		if (canOpenBottomAddActionSheet && networkInfo.online) {
			SheetManager.show("BottomBarAddActionSheet")
		}
	}, [canOpenBottomAddActionSheet, networkInfo.online])

	return (
		<View
			style={{
				paddingTop: 6,
				height: 80,
				flexDirection: "row",
				justifyContent: "space-between",
				borderTopColor: getColor(darkMode, "primaryBorder"),
				borderTopWidth: 0.5
			}}
			onLayout={e => setBottomBarHeight(e.nativeEvent.layout.height)}
		>
			<Pressable
				style={{
					alignItems: "center",
					width: "20%"
				}}
				onPress={() => navTo("recents")}
			>
				<Ionicon
					name={showHome ? "home" : "home-outline"}
					size={22}
					color={showHome ? "#0A84FF" : "gray"}
				/>
				<Text
					style={{
						color: showHome ? "#0A84FF" : "gray",
						fontSize: 10,
						marginTop: 3,
						maxWidth: iconTextMaxWidth
					}}
					numberOfLines={1}
				>
					{i18n(lang, "home")}
				</Text>
			</Pressable>
			<Pressable
				style={{
					alignItems: "center",
					width: "20%"
				}}
				onPress={() => navTo("cloud")}
			>
				<Ionicon
					name={showCloud ? "cloud" : "cloud-outline"}
					size={22}
					color={showCloud ? "#0A84FF" : "gray"}
				/>
				<Text
					style={{
						color: showCloud ? "#0A84FF" : "gray",
						fontSize: 10,
						marginTop: 3,
						maxWidth: iconTextMaxWidth
					}}
					numberOfLines={1}
				>
					{i18n(lang, "cloud")}
				</Text>
			</Pressable>
			{/*<Pressable
				style={{
					alignItems: "center",
					width: "20%",
					paddingTop: 2
				}}
				onPress={openAddSheet}
			>
				<Ionicon
					name={
						networkInfo.online
							? canOpenBottomAddActionSheet
								? "add-circle-outline"
								: "close-circle-outline"
							: "cloud-offline-outline"
					}
					size={30}
					color={
						networkInfo.online && canOpenBottomAddActionSheet ? (darkMode ? "white" : "gray") : darkMode ? "gray" : "lightgray"
					}
				/>
				</Pressable>*/}
			<Pressable
				style={{
					alignItems: "center",
					width: "20%"
				}}
				onPress={() => navTo("chats")}
			>
				<Ionicon
					name={isChatsScreen ? "chatbubble" : "chatbubble-outline"}
					size={22}
					color={isChatsScreen ? "#0A84FF" : "gray"}
				/>
				<Text
					style={{
						color: isChatsScreen ? "#0A84FF" : "gray",
						fontSize: 10,
						marginTop: 3,
						maxWidth: iconTextMaxWidth
					}}
					numberOfLines={1}
				>
					{i18n(lang, "chats")}
				</Text>
			</Pressable>
			<Pressable
				style={{
					alignItems: "center",
					width: "20%"
				}}
				onPress={() => navTo("photos")}
			>
				<Ionicon
					name={isPhotosScreen ? "image" : "image-outline"}
					size={22}
					color={isPhotosScreen ? "#0A84FF" : "gray"}
				/>
				<Text
					style={{
						color: isPhotosScreen ? "#0A84FF" : "gray",
						fontSize: 10,
						marginTop: 3,
						maxWidth: iconTextMaxWidth
					}}
					numberOfLines={1}
				>
					{i18n(lang, "photos")}
				</Text>
			</Pressable>
			<Pressable
				style={{
					alignItems: "center",
					width: "20%"
				}}
				onPress={() => navTo("notes")}
			>
				<Ionicon
					name={isNotesScreen ? "book" : "book-outline"}
					size={22}
					color={isNotesScreen ? "#0A84FF" : "gray"}
				/>
				<Text
					style={{
						color: isNotesScreen ? "#0A84FF" : "gray",
						fontSize: 10,
						marginTop: 3,
						maxWidth: iconTextMaxWidth
					}}
					numberOfLines={1}
				>
					{i18n(lang, "notes")}
				</Text>
			</Pressable>
			{/*<Pressable
				style={{
					alignItems: "center",
					width: "20%"
				}}
				onPress={() => navTo("settings")}
			>
				<Ionicon
					name={showSettings ? "settings" : "settings-outline"}
					size={22}
					color={showSettings ? "#0A84FF" : "gray"}
				/>
				<Text
					style={{
						color: showSettings ? "#0A84FF" : "gray",
						fontSize: 10,
						marginTop: 3,
						maxWidth: iconTextMaxWidth
					}}
					numberOfLines={1}
				>
					{i18n(lang, "settings")}
				</Text>
				</Pressable>*/}
		</View>
	)
})

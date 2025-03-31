import { rtkApi } from "../../../../shared/api/rtkApi";
import { Variables } from "../../../../shared/consts/localVariables";

const url = Variables.Message_URL;

/// TODO: add types for the returned types like build.query<Notification[], null>
export const messageApi = rtkApi.injectEndpoints({
	endpoints: (builder) => ({
		sendMessage: builder.mutation<any, any>({
			query: (body) => ({
				url: "message",
				method: "POST",
				body,
			}),
		}),
		deleteMessage: builder.mutation<{ messageId: string }, any>({
			query: ({ messageId }) => ({
				url: `message/delete?id=${messageId}`,
				method: "DELETE",
				body: { messageId },
			}),
		}),
		getMessages: builder.query<any, any>({
			query: (chatId: string) => `message?chatId=${chatId}`,
		}),
		editMessage: builder.mutation<any, any>({
			query: ({ messageId, newText }) => ({
				url: `message/edit`,
				method: "PUT",
				body: { messageId, newText },
			}),
		}),
	}),
});

export const {
	useGetMessagesQuery,
	useSendMessageMutation,
	useDeleteMessageMutation,
	useEditMessageMutation,
} = messageApi;

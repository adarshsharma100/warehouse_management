import createNotifications from "app/notifications_sents/mutations/createNotifications_sent"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"

const CreateNotifications = (mutationMsg: string) => {
  const [createNotificationsMutations] = useMutation(createNotifications)
  const user = useCurrentUser()

  const { id, role, name, email } = user

  return createNotificationsMutations({
    user_id: id,
    user_name: name,
    user_email: email,
    mutations: mutationMsg,
    created_at: new Date().toString(),
  })
}

export default CreateNotifications

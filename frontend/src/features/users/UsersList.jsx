import React from 'react'
import { useGetUsersQuery } from './usersSlice'
import User from './User'
import useAuth from '../auth/useAuth'

const UsersList = () => {
    // usersList tag is got by the prefetched component
  const { data: users, isError, isLoading, isSuccess, error } = useGetUsersQuery("usersList", {
    pollingInterval: 30000, // This refreshes the data every 30 seconds.
    refetchOnFocus: true,  // This refetches when the window regains focus.
    refetchOnMountOrArgChange: true
})

const {isAdmin, isManager, username} = useAuth()
  let content

  if (isLoading) content = <p>Loading...</p>

  if (isError) {
      content = <p className={`${isError} ? 'errmsg' : 'offscreen'`}>{error?.data?.message}</p>
  }

  if (isSuccess) {

    const { ids, entities} = users
    let filteredIds;
    if(isAdmin || isManager) {
        filteredIds = ids
    } else {
        filteredIds = ids.filter(id => entities[id].username === username)
    }

    const tableContent = ids?.length
        ? ids.map(userId => <User key={userId} userId={userId} />)
        : null

    content = (
        <table className="table table--users">
            <thead className="table__thead">
                <tr>
                    <th scope="col" className="table__th user__username">Username</th>
                    <th scope="col" className="table__th user__roles">Roles</th>
                    <th scope="col" className="table__th user__edit">Edit</th>
                </tr>
            </thead>
            <tbody>
                {tableContent}
            </tbody>
        </table>
    )
}

return content
}

export default UsersList
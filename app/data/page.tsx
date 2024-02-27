import { getXataClient } from "@/libs/xata";

export default async function Data() {
    const data = await getXataClient().db.users.filter({
        givenName: {
            $is: ""
        },
        surname: {
            $is: ""
        }
    }).getMany();

    console.log(data)

    const portriats = await getXataClient().db.portraits.filter({
        mail: {
            $is: data[0].mail?.toLowerCase()
        }
    }).select([
        'portrait.base64Content',
        'schoolbox_id'
    ]).getMany();

    console.log(portriats)

    return (
        <div>
            <h1>data</h1>
            {data.map((user) => (
                <div key={user.id}>
                    <h2>{user.displayName}</h2>
                    <p>{user.mail}</p>
                    {portriats.map((portrait) => (
                        <div key={portrait.id}>
                            <p>{portrait.schoolbox_id}</p>
                            <img src={'data:image/png;base64,' + portrait.portrait?.base64Content} />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
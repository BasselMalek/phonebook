import { FormEvent, useEffect, useState } from "react";
import {
    serverPost,
    serverDel,
    serverGet,
    serverUpdate,
    Person,
} from "./ServerHandler";

const PhoneBookBanner = (props: {
    changedName: string;
    hidden: boolean;
    status: "Added" | "Changed" | "Failed";
}) => {
    return (
        <div
            style={{
                backgroundColor: "#EEEEEE",
                borderStyle: "solid",
                borderWidth: 5,
                borderRadius: 4,
                display: !props.hidden ? "none" : "block",
                borderColor:
                    props.status === "Added"
                        ? "green"
                        : props.status === "Failed"
                        ? "red"
                        : "yellow",
            }}
        >
            <p
                style={{
                    color:
                        props.status === "Added"
                            ? "green"
                            : props.status === "Failed"
                            ? "red"
                            : "yellow",
                    fontStyle: "italic bold",
                    textAlign: "center",
                    fontSize: 32,
                }}
            >
                {props.status === "Failed"
                    ? `Error while modifying ${props.changedName}`
                    : `${props.changedName} was ${props.status}.`}
            </p>
        </div>
    );
};

const PhoneBookForm = (props: {
    phoneBook: Person[];
    newName: string;
    newNumber: string;
    setPhoneBook: Function;
    setNewName: Function;
    setNewNumber: Function;
    setBanner: Function;
}) => {
    const formSubmithandler = async (
        event: FormEvent<HTMLFormElement>
    ): Promise<void> => {
        event.preventDefault();
        const check = props.phoneBook.find((v) => {
            return v.name === props.newName;
        });
        if (check === undefined) {
            const response = await serverPost({
                name: props.newName,
                number: props.newNumber,
            });
            props.setPhoneBook(props.phoneBook.concat(response.data));
            props.setBanner("Added", response.data.name);
        } else {
            if (
                window.confirm(
                    `${props.newName} already exists. Want to update the recorded number?`
                )
            ) {
                const updated = await serverUpdate(check, props.newNumber);
                props.setPhoneBook(
                    props.phoneBook
                        .filter((v) => v.id != updated.data.id)
                        .concat(updated.data)
                );
                props.setBanner("Changed", updated.data.name);
            }
        }
    };
    return (
        <form onSubmit={formSubmithandler}>
            <div>
                name: {"\t"}
                <input
                    value={props.newName}
                    onChange={(e) => {
                        props.setNewName(e.target.value);
                    }}
                />
                <br />
                number:{"\n"}
                <input
                    value={props.newNumber}
                    onChange={(e) => {
                        props.setNewNumber(e.target.value);
                    }}
                />
            </div>
            <div>
                <button type="submit">add</button>
            </div>
        </form>
    );
};

const PhoneBookDisplay = (props: {
    phoneBook: Person[];
    searchTerm: string;
    phoneBooksetter: Function;
    setBanner: Function;
}) => {
    return (
        <div>
            <h2>Numbers</h2>
            <ul>
                {props.phoneBook
                    .filter((v) => {
                        return props.searchTerm === ""
                            ? true
                            : v.name.toLowerCase().includes(props.searchTerm);
                    })
                    .map((v, k) => (
                        <div key={k}>
                            <p>{`${v.name} : ${v.number} \t`}</p>
                            <button
                                onClick={async () => {
                                    try {
                                        const result = await serverDel(v);
                                        if (result!.status != 500)
                                            console.log(
                                                result?.status,
                                                result?.data
                                            );
                                        {
                                            props.phoneBooksetter(
                                                props.phoneBook.filter(
                                                    (v) =>
                                                        v.id != result?.data.id
                                                )
                                            );
                                        }
                                    } catch (e) {
                                        props.setBanner("Failed", v.name);
                                    }
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
            </ul>
        </div>
    );
};

const PhonebookSearch = (props: {
    searchTerm: string | undefined;
    setSearchTerm: Function;
}) => {
    return (
        <div>
            search:{" "}
            <input
                value={props.searchTerm}
                onChange={(e) => {
                    props.setSearchTerm(e.target.value);
                }}
            />
        </div>
    );
};
const App = () => {
    const [persons, setPersons] = useState<Person[]>([]);
    const [newName, setNewName] = useState("");
    const [newNumber, setNewNumber] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [bannerVisible, setBannerVisible] = useState(false);
    const [lastChanged, setLastChanged] = useState("");
    const [bannerType, setBannerType] = useState<
        "Added" | "Changed" | "Failed"
    >("Added");

    useEffect(() => {
        (async () => {
            const JSONReq = await serverGet();
            // const JSONData = JSON.parse(JSONReq.data);
            setPersons(JSONReq.data);
        })();
    }, []);

    useEffect(() => {
        if (bannerVisible) {
            setTimeout(() => {
                setBannerVisible(false);
            }, 5000);
        }
    }, [bannerVisible]);

    return (
        <div>
            <h2>Phonebook</h2>
            <PhoneBookBanner
                changedName={lastChanged}
                status={bannerType}
                hidden={bannerVisible}
            />
            <PhonebookSearch
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />
            <br />
            <PhoneBookForm
                newName={newName}
                newNumber={newNumber}
                setNewName={setNewName}
                setNewNumber={setNewNumber}
                phoneBook={persons}
                setPhoneBook={setPersons}
                setBanner={(
                    t: "Added" | "Changed" | "Failed",
                    name: string
                ) => {
                    setBannerVisible(true);
                    setBannerType(t);
                    setLastChanged(name);
                }}
            />
            <PhoneBookDisplay
                phoneBook={persons}
                phoneBooksetter={setPersons}
                searchTerm={searchTerm}
                setBanner={(
                    t: "Added" | "Changed" | "Failed",
                    name: string
                ) => {
                    setBannerVisible(true);
                    setBannerType(t);
                    setLastChanged(name);
                }}
            />
        </div>
    );
};

export default App;

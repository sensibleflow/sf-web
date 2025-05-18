<script setup lang="ts">
import { onMounted } from "vue"
import { useSensibleFlowStore } from '@/stores/SensibleFlow'
import { storeToRefs } from 'pinia'
import Fuse from 'fuse.js'

const store = useSensibleFlowStore()
const { sfon, current_id, previous_id, current_insert_id } = storeToRefs(store)

onMounted(async () => {
    try {
        let pathname = "sfon.json"

        const { data, status, error, refresh } = await useFetch(`/api/json/${pathname}`)

        data.value === undefined ? sfon.value = [] : sfon.value = data.value as any

        current_id.value = [0]
        
        update_view()

        // async function deleteJson(pathname: string) {
        //     await $fetch(`/api/json/${pathname}`, { method: 'DELETE' })
        //     //await refresh()
        // }

        window.onbeforeunload = async function (event) {
            // let warn = false;
            // window.addEventListener('beforeunload', e => {
            // if (!warn) return;
            // // Cancel the event
            // e.preventDefault();
            // // Chrome requires returnValue to be set
            // e.returnValue = '';
            // });
            // warn = true;

            const line = document.getElementById(current_id.value.toString())!.innerHTML
            let data: string = ""
            line.endsWith(":") ? data = "key" : data = "element"
            update_ids(data, Task.None, History.None);
            update_sfon(line, data, Task.None, History.None);

            await $fetch('/api/json/files', {
                method: 'POST',
                contentType: 'application/json',
                body: JSON.stringify(toRaw(sfon.value))
            }).catch((err) => console.log("alert('Failed to upload json:\n'+ err.data?.message)"))
        }
    } catch (e) {
        console.log(e)
    }
})

function update_view() {
    const general_info = document.getElementById("general_info")
    let old_node: HTMLElement = document.getElementById("position") as HTMLElement
    let node: HTMLElement = old_node as HTMLElement
    node.innerHTML = current_coordinate
    node.style.paddingLeft = "4px"
    node.style.paddingRight = "4px"
    general_info!.replaceChild(old_node, node)

    switch (current_coordinate) {
        case Coordinates.LeftVisitorGeneral:
        case Coordinates.LeftVisitorInsert:
        case Coordinates.LeftEditorGeneral:
        case Coordinates.LeftEditorInsert:
        case Coordinates.LeftEditorNormal:
        case Coordinates.LeftEditorVisual:
            update_left()
            break
        case Coordinates.RightInfo:
        case Coordinates.RightCommand:
        case Coordinates.RightFind:
            update_right()
            break
        default: { 
            throw Error("Coordinate not found") // TODO implement this error as CoordinateError
        }
    }    
}

function update_left() {
    let body = document.getElementById("general_body")
    
    body!.innerHTML = ""

    const code = document.createElement("code")
    code.id = "contents"
    code.style.overflow = "auto"
    code.classList = "overflow-hidden whitespace-nowrap w-full max-w-screen-lg mx-auto pt-3 flex-1"

    if (sfon.value.length === 0) {
        const node = document.createElement("span")

        sfon.value.push("")

        if (current_id.value.length === 0) current_id.value.push(0)

        node.id = current_id.value.toString()
        node.innerHTML = ""
        node.style.marginLeft = 0 + "ch"
        node.style.backgroundColor = "#C0ECB8" // light green
        node.style.paddingLeft = "4px"
        node.style.paddingRight = "4px"
        node.contentEditable = "false"
        node.tabIndex = -1
        node.className = "line"
        code!.appendChild(node)

        node.focus()
    } else {
        run_through_objects_plus_add(sfon.value, code, update_id)
    }

    body!.appendChild(code)

    let node = document.getElementById(current_id.value.toString())
    placeCaretAtEnd(node)
    node!.focus()

    // TODO

    // Manoeuvreren:
    // - enter
    // - escape
    // - tab
    // - hjkl en de pijltjes
    // - colon
    // - ctrl f en ctrl f f en / en :/replace
    // - ctrl xcv + dd yy p
    // - undo en redo
    // - ctrl a
    // - tests
    // - grote schermen en kleine schermen
    // - line numbers? relatief of absoluut, span voor de lijnen
    // - infinite scroll
    // - laatst gebruikt current_id in indexeddb, en ook het aantal lijnen ervoor om de positie goed te hebben
    // - undo_history en command_history
    // - indexeddb om de server te sparen
    // - 'size of sfon' laten zien in general_info
    // - enumeraten van links, pictures en videos
    // - lazy lezen van links in zelfde domain
    // - book: pijltjes links rechts

    // een undo history van 500 stappen moet voldoende zijn
    // cut opnemen in undo_history

    // met een hash werken en in indexeddb opslaan, vergelijken met de blob hash te vinden in de D1 of KV
    // in de store moet je een module kunnen terugvinden via een blob id/hash
    // als values van een kv te groot worden dan de value apart opslaan

    // indexeddb --> geen size limit --> localforage van nuxt

    // find_the_tree() algoritm function, voor automatisch signatures
    // + reviewers die nieuwe signatures waarderen

    // privacy policy, cookie policy & disclaimer
    // hoe cookies van externe sites bewaren?

    // tab scroll werkt niet met die filter, dus ctrl f toevoegen in tab

    // TODO TODO

    // update_history: kan een structuur herzet worden want line is een string --> ook voor ccp

    // ctrl v ergens zonder iets in die buffer, dan verdwijnt het, is empty

    /////
    // ctrl en cijfer of letter voor links en dan verschijnt het cijfer of de letter???? in visitor mode en niet in input
    // radio and check box met spacebar, enter voor submit
    // een y en n, voor yes no, voor bij het ontbreken van een signature om naar editor mode te gaan

    // --> visitor mode (find, i en a voor input, space voor radio en check, colon, enter voor form) --> insert mode (colon)
    //                                                                                               --> info mode
    // --> editor mode (find, colon) --> insert mode (ccp, find, undo, redo, colon)
    //                               --> normal mode (find, colon, vim) --> visual mode (colon, vim)
    //                               --> info mode

    // one html tag per line? toch voor input

    // TODO TODO

    // layer tonen in general_info

    // bij een form moeten de form tags gehide worden in visitor en getoond in editor
    // de id's moeten even wel opvolgen om bruikbaar zijn met de pijltjes
    // en wat met radio buttons en check boxes?

    // undo werkt nog niet naar behoren
}

let update_id: number[] = [-1]

function run_through_objects_plus_add(_sfon: any, code: any, _update_id: any[]) {
    for (let i = 0; i < _sfon.length; ++i) {
        if (typeof _sfon[i] === "string" || _sfon[i].length === 0) {
            //console.log("run through 1", i, _update_id, previous_id.value, current_id.value, _sfon, _sfon[i])
            const node = document.createElement("span")

            _update_id[_update_id.length - 1] = i

            node.id = _update_id.toString()
            if (current_coordinate === Coordinates.LeftVisitorGeneral
                || current_coordinate === Coordinates.LeftVisitorInsert
            ) {
                const textarea = document.createElement('textarea')
                textarea.innerHTML = _sfon[i]
                node.innerHTML = textarea.textContent as string
            } else {
                node.innerHTML = _sfon[i]
            }
            node.role = "treeitem"
            node.style.marginLeft = (_update_id.length - 1) * 4 + "ch"
            if (_update_id.toString() === current_id.value.toString()
                && (current_coordinate === Coordinates.LeftEditorGeneral
                    || current_coordinate === Coordinates.LeftEditorInsert
                    || current_coordinate === Coordinates.LeftEditorNormal
                    || current_coordinate === Coordinates.LeftVisitorGeneral)
            ) {
                node.style.backgroundColor = "#C0ECB8" // light green
            }
            node.style.paddingLeft = "4px"
            node.style.paddingRight = "4px"
            _update_id.toString() === current_insert_id.value.toString() ? node.contentEditable = "true" : node.contentEditable = "false"
            node.tabIndex = -1
            node.className = "line"
            code!.appendChild(node)
        } else if (_sfon[i] instanceof Object) {
            //console.log("run through 2", _update_id, previous_id.value, current_id.value, _sfon, sfon.value)

            const node = document.createElement("span")

            _update_id[_update_id.length - 1] = i

            node.id = _update_id.toString()
            if (current_coordinate === Coordinates.LeftVisitorGeneral
                || current_coordinate === Coordinates.LeftVisitorInsert
            ) {
                const textarea = document.createElement('textarea')
                textarea.innerHTML = Object.keys(_sfon[i])[0]!.toString()
                node.innerHTML = textarea.textContent as string
            } else {
                node.innerHTML = Object.keys(_sfon[i])[0]!.toString()
            }
            node.role = "treeitem"
            node.style.marginLeft = (_update_id.length - 1) * 4 + "ch"
            if (_update_id.toString() === current_id.value.toString()
                && (current_coordinate === Coordinates.LeftEditorGeneral
                    || current_coordinate === Coordinates.LeftEditorInsert
                    || current_coordinate === Coordinates.LeftEditorNormal
                    || current_coordinate === Coordinates.LeftVisitorGeneral)
            ) {
                node.style.backgroundColor = "#C0ECB8" // light green
            }
            node.style.paddingLeft = "4px"
            node.style.paddingRight = "4px"
            _update_id.toString() === current_insert_id.value.toString() ? node.contentEditable = "true" : node.contentEditable = "false"
            node.tabIndex = -1
            node.className = "line"
            code!.appendChild(node)

            _update_id.push(-1)

            run_through_objects_plus_add(Object.values(_sfon[i])[0], code, _update_id)

            _update_id.pop()
        }
    }

    update_id = [-1]
}

const delta = 400;
let last_keypress_time = 0;
let undo_position: number = 0;

function handle_keys(event: any) {
    try {
        if (event && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey
            && event.key === "Tab"
        ) {
            event.preventDefault();

            console.log("tab", current_coordinate)
            
            handle_tab()
        } else if (event && ((event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey
                   && event.key === "a")
                   || (!event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey
                   && event.key === "Enter"))
                   && current_coordinate === Coordinates.LeftEditorGeneral
        ) {
            event.preventDefault()

            console.log("append line")

            handle_ctrl_a(History.None)
        } else if (event && event.ctrlKey && event.shiftKey && !event.altKey && !event.metaKey
                   && event.key === "A"
                   && current_coordinate === Coordinates.LeftEditorInsert
        ) {
            event.preventDefault()

            console.log("append line in editor insert")

            handle_ctrl_shift_a(event, History.None)
        } else if (event && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey
                   && event.key === "Enter"
        ) {
            event.preventDefault()

            console.log("enter")

            handle_enter(History.None)
        } else if (event && event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey
                   && event.key === "Enter"
        ) {
            event.preventDefault()

            console.log("ctrl enter")

            handle_ctrl_enter(event, History.None)
        } else if (event && event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey
                   && event.key === "i"
                   && current_coordinate === Coordinates.LeftEditorGeneral
        ) {
            event.preventDefault()

            console.log("insert line")

            handle_ctrl_i(History.None)
        } else if (event && event.ctrlKey && event.shiftKey && !event.altKey && !event.metaKey
                   && event.key === "I"
                   && current_coordinate === Coordinates.LeftEditorInsert
        ) {
            event.preventDefault()

            console.log("insert line in editor insert")

            handle_ctrl_shift_i(event, History.None)
        } else if (event && event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey
                   && event.key === "d"
                   && current_coordinate === Coordinates.LeftEditorGeneral
        ) {
            event.preventDefault()

            console.log("delete")

            handle_delete(History.None)
        } else if (event && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey
                   && event.key === ":"
                   && (current_coordinate !== Coordinates.LeftVisitorInsert
                       && current_coordinate !== Coordinates.LeftEditorInsert
                   )
        ) {
            event.preventDefault()

            console.log("command")

            handle_colon()
        } else if (event && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey
                   && ((event.key === "k" && (current_coordinate === Coordinates.LeftVisitorGeneral
                                              || current_coordinate === Coordinates.LeftEditorGeneral))
                        || (event.key === "ArrowUp"
                            && current_coordinate !== Coordinates.LeftVisitorInsert
                            && current_coordinate !== Coordinates.LeftEditorInsert))
        ) {
            console.log("up")

            handle_up(event)
        } else if (event && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey
                   && ((event.key === "j" && (current_coordinate === Coordinates.LeftVisitorGeneral
                                              || current_coordinate === Coordinates.LeftEditorGeneral))
                        || (event.key === "ArrowDown"
                            && current_coordinate !== Coordinates.LeftVisitorInsert
                            && current_coordinate !== Coordinates.LeftEditorInsert))
        ) {
            console.log("down")

            handle_down(event)
        } else if (event && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey
                   && ((event.key === "h" && (current_coordinate === Coordinates.LeftVisitorGeneral
                                             || current_coordinate === Coordinates.LeftEditorGeneral))
                        || event.key === "ArrowLeft")
        ) {
            console.log("left")

            handle_left(event)
        } else if (event && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey
                   && ((event.key === "l" && (current_coordinate === Coordinates.LeftVisitorGeneral
                                              || current_coordinate === Coordinates.LeftEditorGeneral))
                        || event.key === "ArrowRight")
        ) {
            console.log("right")

            handle_right(event)
        } else if (event && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey
                   && event.key === "i"
        ) {
            console.log("insert text")

            handle_i(event)
        } else if (event && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey
                   && event.key === "a"
        ) {
            console.log("append text")

            handle_a(event)
        } else if (event && event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey
                   && event.key === "z"
        ) {
            event.preventDefault()

            console.log("undo")

            handle_history(History.Undo)
        } else if (event && event.ctrlKey && event.shiftKey && !event.altKey && !event.metaKey
                   && event.key === "Z"
        ) {
            event.preventDefault()

            console.log("redo")

            handle_history(History.Redo)
        } else if (event && event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey
                   && event.key === "x"
                   && (current_coordinate !== Coordinates.LeftEditorInsert
                       && current_coordinate !== Coordinates.LeftVisitorInsert
                   )
        ) {
            console.log("cut")

            event.preventDefault()

            handle_sfon_for_ccp(Task.Cut)
        } else if (event && event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey 
                   && event.key === "c"
                   && (current_coordinate !== Coordinates.LeftEditorInsert
                       && current_coordinate !== Coordinates.LeftVisitorInsert
                   )
        ) {
            console.log("copy")

            event.preventDefault()

            handle_sfon_for_ccp(Task.Copy)
        } else if (event && event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey
                   && event.key === "v"
                   && (current_coordinate !== Coordinates.LeftEditorInsert
                       && current_coordinate !== Coordinates.LeftVisitorInsert
                   )
        ) {
            console.log("paste")

            event.preventDefault()

            handle_sfon_for_ccp(Task.Paste)
        } else if (event && event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey
                   && event.key === "f"
        ) {
            event.preventDefault()

            console.log("find")

            handle_find()
        } else if (event && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey
                   && event.key === "Escape"
        ) {
            event.preventDefault()

            console.log("escape")

            handle_escape()
        } else if (event && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey
                   && event.key === "e"
                   && (current_coordinate === Coordinates.LeftVisitorGeneral
                       || current_coordinate === Coordinates.LeftEditorGeneral
                   )
        ) {
            console.log("to editor general mode")

            event.preventDefault()

            current_command = Commands.EditorMode
            handle_command()
        } else if (event && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey
                   && event.key === "v"
                   && (current_coordinate === Coordinates.LeftVisitorGeneral
                       || current_coordinate === Coordinates.LeftEditorGeneral
                   )
                   
        ) {
            console.log("to visitor general mode")

            event.preventDefault()

            current_command = Commands.VisitorMode
            handle_command()
        } else if (event && (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey)) {
            console.log("ctrl || shift || alt || meta")
        } else {
            console.log("input", event.key, event.code, event.keyCode)

            handle_input(event)
        }
    } catch (e) {
        if (e instanceof ColonError) {
            console.log(e.get_message())
        }
    }
}

function handle_tab() {
    previous_coordinate = current_coordinate.slice() as Coordinates
    current_coordinate = Coordinates.RightInfo

    create_list_right()

    update_view()
}

let input_down: boolean = false

function handle_input(event: Event) {
    input_down = true
}

function handle_input_up(event: Event) {
    console.log("handle input up")

    if (current_coordinate === Coordinates.RightInfo
        || current_coordinate === Coordinates.RightCommand
    ) {
        let input_right = document.getElementById("input_right")
        populate_list_right(input_right!.innerHTML)
        update_view()

        input_down = false
    } else if (current_coordinate === Coordinates.RightFind) {
        update_view()

        input_down = false
    }
}

function handle_ctrl_a(history: History) {
    let this_keypress_time = Date.now()

    if (this_keypress_time - last_keypress_time <= delta
    ) {
        this_keypress_time = 0
        handle_history(History.Undo)
        update_state(Task.AppendAppend, History.None)
        update_view()
    } else {
        update_state(Task.Append, history)
        update_view()
    }

    last_keypress_time = this_keypress_time
}

function handle_ctrl_shift_a(event: Event, history: History) {
    handle_escape()

    let this_keypress_time = Date.now()

    if (this_keypress_time - last_keypress_time <= delta) {
        this_keypress_time = 0
        handle_history(History.Undo)
        update_state(Task.AppendAppend, History.None)
        update_view()
    } else {
        update_state(Task.Append, history)
        update_view()
    }

    last_keypress_time = this_keypress_time

    handle_a(event)
}

async function handle_enter(history: History) {
    let this_keypress_time = Date.now()

    if (current_coordinate === Coordinates.RightInfo) {
        current_id.value = ((document.querySelector('input[name="list item"]:checked') as HTMLInputElement).value)
            .split(',')
            .map(function(item) {
                return parseInt(item, 10)
            })
        current_coordinate = previous_coordinate.slice() as Coordinates
        update_view()
    } else if (current_coordinate === Coordinates.RightCommand) {
        let id = ((document.querySelector('input[name="list item"]:checked') as HTMLInputElement).value as any)
            .split(',')
            .map(function(item: any) {
                return parseInt(item, 10)
            })
        current_command = filtered_list_right[id]!.value as Commands
        handle_command()
        update_view()
    } else if (current_coordinate === Coordinates.RightFind) {
        // Nothing to do
    } else

    last_keypress_time = this_keypress_time
}

function handle_ctrl_enter(event: Event, history: History) {
    if (current_coordinate === Coordinates.LeftEditorInsert) {
        update_state(Task.Input, History.None)
        current_coordinate = Coordinates.LeftEditorGeneral
        handle_right(event)
        handle_a(event)
    }
}

function handle_command() {
    console.log("handle commmand:", previous_id.value, current_id.value, current_command)

    if (current_command === undefined) {
        current_command = (document.querySelector('input[name="list item"]:checked') as HTMLInputElement).value as Commands
    }

    switch (current_command) {
        case Commands.EditorMode:
            previous_coordinate = current_coordinate.slice() as Coordinates
            current_coordinate = Coordinates.LeftEditorGeneral
            update_view()
            break
        case Commands.VisitorMode:
            previous_coordinate = current_coordinate.slice() as Coordinates
            current_coordinate = Coordinates.LeftVisitorGeneral
            update_view()
            break
        default: { 
            throw Error("Command not found") // TODO implement this error as CommandError
        }
    }

    current_command = undefined
}

function handle_ctrl_i(history: History) {
    let this_keypress_time = Date.now()

    if (this_keypress_time - last_keypress_time <= delta
    ) {
        this_keypress_time = 0;
        handle_history(History.Undo)
        update_state(Task.InsertInsert, History.None)
        update_view()
    } else {
        update_state(Task.Insert, history)
        update_view()
    }

    last_keypress_time = this_keypress_time
}

function handle_ctrl_shift_i(event: Event, history: History) {
    handle_escape()

    let this_keypress_time = Date.now()

    if (this_keypress_time - last_keypress_time <= delta) {
        this_keypress_time = 0
        handle_history(History.Undo)
        update_state(Task.InsertInsert, History.None)
        update_view()
    } else {
        update_state(Task.Insert, history)
        update_view()
    }

    last_keypress_time = this_keypress_time

    handle_i(event)
}

function handle_delete(history: History) {
    update_state(Task.Delete, history)
    update_view()
}

function handle_colon() {
    console.log("handle colon command", document.activeElement)

    previous_coordinate = current_coordinate.slice() as Coordinates
    current_coordinate = Coordinates.RightCommand

    create_list_right()

    update_view()
}

function handle_up(event: Event) {
    event.preventDefault()
    
    if (current_coordinate === Coordinates.RightInfo
        || current_coordinate === Coordinates.RightCommand
        || current_coordinate === Coordinates.RightFind
    ) {
        if (list_index > 0) --list_index

        update_view()
    } else if (current_coordinate !== Coordinates.LeftEditorInsert) {
        update_state(Task.KArrowUp, History.None)
        update_view()
    }
}

function handle_down(event: Event) {
    event.preventDefault()

    if (current_coordinate === Coordinates.RightInfo
        || current_coordinate === Coordinates.RightCommand
        || current_coordinate === Coordinates.RightFind
    ) {
        if (filtered_list_right.length === 0) filtered_list_right = total_list_right

        if (list_index < filtered_list_right.length - 1) ++list_index

        update_view()
    } else if (current_coordinate !== Coordinates.LeftEditorInsert) {
        update_state(Task.JArrowDown, History.None)
        update_view()
    }
}

function handle_left(event: Event) {
    if (current_coordinate === Coordinates.RightInfo
        || current_coordinate === Coordinates.RightCommand
        || current_coordinate === Coordinates.RightFind
    ) {
        // Nothing to do
    } else if (current_coordinate !== Coordinates.LeftEditorInsert) {
        event.preventDefault()

        update_state(Task.HArrowLeft, History.None)
        update_view()
    }
}

function handle_right(event: Event) {
    if (current_coordinate === Coordinates.RightInfo
        || current_coordinate === Coordinates.RightCommand
        || current_coordinate === Coordinates.RightFind
    ) {
        // Nothing to do
    } else if (current_coordinate !== Coordinates.LeftEditorInsert) {
        event.preventDefault()

        update_state(Task.LArrowRight, History.None)
        update_view()
    }
}

function handle_i(event: Event) {
    event.preventDefault()

    if (current_coordinate === Coordinates.LeftEditorGeneral) {
        current_insert_id.value = current_id.value
        previous_coordinate = current_coordinate.slice() as Coordinates
        current_coordinate = Coordinates.LeftEditorInsert
        update_view()
        let node = document.getElementById(current_id.value.toString())
        setCaretPosition(node, 0) // TODO de i en de a interferen hier, zie placecaretatend in update_left en update_view hiervoor
        current_insert_id.value = []
    }
}

function handle_a(event: Event) {
    event.preventDefault()

    if (current_coordinate === Coordinates.LeftEditorGeneral) {
        current_insert_id.value = current_id.value
        previous_coordinate = current_coordinate.slice() as Coordinates
        current_coordinate = Coordinates.LeftEditorInsert
        update_view()
        current_insert_id.value = []
    }
}

function handle_history(history: History) {
    try {
        if (undo_history.length > 0) {
            console.log("handle history", undo_history, undo_position, current_id.value)

            if (history === History.Undo) {
                const line = document.getElementById(current_id.value.toString())!.innerHTML
                let data: string = ""
                line.endsWith(":") ? data = "key" : data = "element"
                update_ids(data, Task.None, History.None)
                update_sfon(line, data, Task.None, History.None)
                // hier stond een update_history met Task.Input
                
                if (undo_position < undo_history.length) ++undo_position

                const undo_element = undo_history[undo_history.length - undo_position]

                current_id.value = undo_element.id.slice()

                console.log("handle history1", undo_element, history, current_id.value, undo_history.slice(), undo_position, line)

                switch (undo_element.task) {
                    case "append":
                    case "append append":
                    case "insert":
                    case "insert insert":
                        handle_delete(history)
                        undo_history[undo_history.length - undo_position].line = "" // TODO moet nog bij de rest
                        break
                    case "delete": {
                        if (current_id.value[current_id.value.length - 1] === 0) {
                            handle_ctrl_i(history)
                        } else {
                            handle_ctrl_a(history)
                        }
                        break
                    }
                }

                console.log("handle history11", undo_element, history, current_id.value, undo_history.slice(), undo_position)
            } else if (history === History.Redo) {
                const redo_element = undo_history[undo_history.length - undo_position]

                current_id.value = redo_element.id.slice();

                console.log("handle history2", redo_element, history, current_id.value, undo_history.slice(), undo_position)

                switch (redo_element.task) {
                    case "append":
                    case "append append": {
                        handle_ctrl_a(history)
                        break
                    }
                    case "insert":
                    case "insert insert": {
                        handle_ctrl_i(history)
                        break
                    }
                    case "delete": {
                        if (current_id.value[current_id.value.length - 1] === 0) {
                            handle_ctrl_i(history)
                        } else {
                            handle_ctrl_a(history)
                        }
                        // handle_delete()
                        break
                    }
                }

                if (undo_position >= 0) --undo_position

                console.log("handle history22", redo_element, history, current_id.value, undo_history.slice(), undo_position)
            }
        } else {
            throw new UndoError("there is no undo history")
        }
    } catch (e) {
        if (e instanceof UndoError) {
            console.log(e.get_message())
        }
    }
}

let cut_copy_paste_buffer: [] | {} = []

function handle_sfon_for_ccp(task: Task) {
    // ccp = cut-copy-paste
    console.log("handle sfon for ccp cut copy paste", previous_id.value, current_id.value)

    if (current_coordinate !== Coordinates.LeftEditorGeneral
        && current_coordinate !== Coordinates.LeftEditorInsert
        && current_coordinate !== Coordinates.LeftEditorNormal) {
        return
    }

    let _sfon: any = toRaw(sfon.value)

    for (let i = 0; i < current_id.value.length - 1; i++) {
        _sfon = Object.values(_sfon[current_id.value[i]])[0]
    }

    console.log("handle sfon for ccp cut copy paste__________", _sfon.slice())

    if (task === Task.Paste) {
        _sfon[current_id.value[current_id.value.length - 1]] = cut_copy_paste_buffer
        update_history(task, "none", cut_copy_paste_buffer.toString(), History.None) // TODO misschien moet line meer zijn dan alleen string
        update_view()
        console.log("handle sfon for ccp cut copy paste3", previous_id.value, current_id.value, _sfon, cut_copy_paste_buffer)

        return
    }

    if (_sfon[current_id.value[current_id.value.length - 1]] instanceof Object && !next_layer_exists()) {
        cut_copy_paste_buffer = Object.values(_sfon[current_id.value[current_id.value.length - 1]])[0] as {}
    } else {
        cut_copy_paste_buffer = _sfon[current_id.value[current_id.value.length - 1]]
    }

    console.log("handle sfon for ccp cut copy paste__________", cut_copy_paste_buffer)

    if (task === Task.Cut) {
        _sfon.splice(current_id.value[current_id.value.length - 1], 1)
        if (current_id.value[current_id.value.length - 1] > 0) --current_id.value[current_id.value.length - 1]
        update_history(task, "none", cut_copy_paste_buffer.toString(), History.None)
    }

    update_view()

    console.log("handle sfon for ccp cut copy paste2", previous_id.value, current_id.value, _sfon.slice(), cut_copy_paste_buffer)
}

let total_list_right: Find[] = []
let filtered_list_right: Find[] = []

interface Find {
    id: number[],
    value: string,
}

function handle_find() {
    console.log("handle find")

    if (current_coordinate !== Coordinates.RightInfo
        && current_coordinate !== Coordinates.RightCommand
    ) {
        previous_coordinate = current_coordinate.slice() as Coordinates
        current_coordinate = Coordinates.RightFind

        let this_keypress_time = Date.now()

        if (this_keypress_time - last_keypress_time <= delta) {
            this_keypress_time = 0
            
            // Nothing to do
        } else {
            // Nothing to do
        }

        update_view()
    }

    console.log("handle find 2")
}

function handle_escape() {
    console.log("handle escape", previous_coordinate, current_coordinate)

    if (previous_coordinate === Coordinates.LeftVisitorGeneral
        || previous_coordinate === Coordinates.LeftVisitorInsert
    ) {
        if (current_coordinate === Coordinates.LeftVisitorInsert) {
            update_state(Task.Input, History.None)
            update_view()
        }
        current_coordinate = Coordinates.LeftVisitorGeneral
    } else {
        if (current_coordinate === Coordinates.LeftEditorInsert) {
            update_state(Task.Input, History.None)
            update_view()
        }
        current_coordinate = Coordinates.LeftEditorGeneral
    }

    previous_coordinate = current_coordinate.slice() as Coordinates

    update_view()

    console.log("handle escape 2", previous_coordinate, current_coordinate)
}

function create_list_right() {
    console.log("create list right")

    total_list_right = []

    if (current_coordinate === Coordinates.RightInfo) {
        let _sfon: any = toRaw(sfon.value)

        for (let i = 0; i < current_id.value.length - 1; i++) {
            _sfon = Object.values(_sfon[current_id.value[i]])[0]
        }

        let this_id = current_id.value.slice()
        this_id[this_id.length - 1] = 0
        for (let el in _sfon) {
            if (_sfon[el] instanceof Object) {
                const textarea = document.createElement('textarea')
                textarea.innerHTML = Object.keys(_sfon[el])[0]!.toString()
                total_list_right.push({id: this_id.slice(), value: textarea.textContent as string})
                ++this_id[this_id.length - 1]
            } else {
                const textarea = document.createElement('textarea')
                textarea.innerHTML = _sfon[el].toString()
                total_list_right.push({id: this_id.slice(), value: textarea.textContent as string})
                ++this_id[this_id.length - 1]
            }
        }
    } else if (current_coordinate === Coordinates.RightCommand) {
        let commands: any = Object.values(Commands)
        for (let i = 0; i < commands.length; i++) {
            total_list_right.push({id: [i], value: commands[i]})
        }
    } else if (current_coordinate === Coordinates.RightFind) {
        // Nothing to do
    }

    console.log("create list right 2", total_list_right)
}

function populate_list_right(search_string: string) {
    console.log("populate list right", total_list_right)

    const options = {
        includeScore: true,
        keys: ['value']
    }

    const fuse = new Fuse(total_list_right, options)

    const result = fuse.search(search_string)

    filtered_list_right = result.map(({ item }) => item)

    console.log("populate list right 2", result, filtered_list_right)
}

enum Task {
    None = "none",
    Input = "input",
    Append = "append",
    AppendAppend = "append append",
    Insert = "insert",
    InsertInsert = "insert insert",
    Delete = "delete",
    KArrowUp = "up",
    JArrowDown = "down",
    HArrowLeft = "left",
    LArrowRight = "right",
    Cut = "cut",
    Copy = "copy",
    Paste = "paste",
}

enum History {
    None = "none",
    Undo = "undo",
    Redo = "redo",
}

function update_state(task: Task, history: History) {
    console.log("update state", task, previous_id.value, current_id.value);

    let line: any
    if (history === History.Undo || history === History.Redo) {
        line = undo_history[undo_history.length - undo_position].line
    } else {
        line = document.getElementById(current_id.value.toString())!.innerHTML
    }

    console.log("update  state line:", line)

    let data: string = ""
    line.endsWith(":") ? data = "key" : data = "element"
    update_ids(data, task, history)
    update_sfon(line, data, task, history)
    update_history(task, data, line, history)
}

let undo_history: any[] = []

interface UndoData {
    id: number[]
    task: string
    data: string
    line: string
}

function update_history(task: Task, data: string, line: string, history: History) {
    console.log("update history", line, task)

    if (history !== History.Undo && history !== History.Redo) {
        if (task === Task.Append || task === Task.AppendAppend || task === Task.Insert || task === Task.InsertInsert || task === Task.Delete) {
            let undo: UndoData = { id: current_id.value.slice(), task: task, data: data, line: line }
            undo_history.push(undo)
        } else if (task === Task.Input) {
            console.log(1) // TODO line moet aangepast worden in de append, en wat komt eerst in hist input of append?
            // of zoals in handle_history de line aanpassen in position, zie comment met "" in handle_history
            const element: UndoData = { id: current_id.value.slice(), task: task, data: data, line: line }
            console.log(2, element, line)
            undo_history.push(element)
            console.log(3)
        }
    }

    console.log("update history2", undo_history.slice())
}

function next_layer_exists() {
    console.log("next layer exists", previous_id.value, current_id.value)

    let _sfon: any = toRaw(sfon.value)

    for (let i = 0; i < previous_id.value.length - 1; i++) {
        _sfon = Object.values(_sfon[previous_id.value[i]])[0]
    }

    console.log("next layer exists 21")
    if (previous_id.value.length === 1) {
        _sfon === Object.values(_sfon[previous_id.value[previous_id.value.length - 1]])
    }

    let this_command: any = ""
    if (Object.values(_sfon[previous_id.value[previous_id.value.length - 1]])[0] !== undefined) {
        this_command = (Object.values(_sfon[previous_id.value[previous_id.value.length - 1]])[0] as any)[0]
    }

    console.log("next layer exists 2", previous_id.value, current_id.value, _sfon[previous_id.value[previous_id.value.length - 1]] instanceof Object)

    return _sfon[previous_id.value[previous_id.value.length - 1]] instanceof Object
}

function get_max_id_in_current(): number {
    console.log("max id current", previous_id.value, current_id.value)

    let _sfon: any = toRaw(sfon.value)

    for (let i = 0; i < current_id.value.length - 1; i++) {
        _sfon = Object.values(_sfon[current_id.value[i]])[0]
    }

    console.log("max id current 2_", _sfon.length - 1)

    return _sfon.length - 1
}

function update_ids(data: string, task: Task, history: History) {
    console.log("update ids", data, task, "_|_", previous_id.value, current_id.value, sfon.value.slice());

    previous_id.value = current_id.value.slice()

    if (history === History.Undo || history === History.Redo) return

    if (task === Task.KArrowUp && current_id.value[current_id.value.length - 1] > 0) {
        --current_id.value[current_id.value.length - 1];
    } else if (task === Task.JArrowDown && current_id.value[current_id.value.length - 1] < get_max_id_in_current()) {
        ++current_id.value[current_id.value.length - 1];
    } else if (task === Task.HArrowLeft && current_id.value.length > 1) {
        current_id.value.pop()
    } else if (task === Task.LArrowRight && next_layer_exists()) {
        current_id.value.push(0)
    } else if (task === Task.Append && current_coordinate === Coordinates.LeftEditorGeneral) {
        if (data === "element") {
            ++current_id.value[current_id.value.length - 1]
        } else if (data === "key") {
            if (next_layer_exists()) {
                ++current_id.value[current_id.value.length - 1]
            } else {
                current_id.value.push(0)
            }
        }
    } else if (task === Task.AppendAppend && current_coordinate === Coordinates.LeftEditorGeneral) {
        current_id.value[current_id.value.length - 1] = get_max_id_in_current() + 1
    } else if (task === Task.Insert && current_coordinate === Coordinates.LeftEditorGeneral) {
        // nothing to do
    } else if (task === Task.InsertInsert && current_coordinate === Coordinates.LeftEditorGeneral) {
        current_id.value[current_id.value.length - 1] = 0
    } else if (task === Task.Delete && current_coordinate === Coordinates.LeftEditorGeneral) {
        // nothing to do
    } else if (task === Task.Input) {
        // nothing to do
    }

    console.log("update ids 2", previous_id.value, current_id.value);
}

function update_sfon(line: any, data: string, task: Task, history: History) {
    console.log("update sfon struct", line, previous_id.value, current_id.value);
    console.log("update", data, task);

    let _sfon: any = toRaw(sfon.value)

    for (let i = 0; i < previous_id.value.length; i++) {
        console.log("beestje", _sfon.slice())
        if (data === "key" && (current_coordinate === Coordinates.LeftEditorGeneral
                               || current_coordinate === Coordinates.LeftEditorInsert
                               || current_coordinate === Coordinates.LeftEditorNormal
                               || current_coordinate === Coordinates.LeftEditorVisual)
        ) {
            console.log("beestje1")

            if (task === Task.Delete && i === current_id.value.length - 1) {
                console.log("beestje10", previous_id.value, current_id.value, _sfon.slice())

                _sfon.splice(current_id.value[i], 1)
                if (i !== 0) _sfon.splice(current_id.value[i], 0, "")
            }

            if (_sfon[previous_id.value[i]] instanceof Object) {
                console.log("beestje11", previous_id.value, current_id.value, _sfon.slice(), i)

                if (i < previous_id.value.length - 1) {
                    console.log("beestje111")
                    _sfon = Object.values(_sfon[previous_id.value[i]])[0]
                } else {
                    console.log("beestje112")
                    if (task === Task.Append || task === Task.AppendAppend || task === Task.Insert || task === Task.InsertInsert) {
                        console.log("beestje1121")

                        _sfon[previous_id.value[i]] = { [line]: Object.values(_sfon[previous_id.value[i]])[0] };
                        _sfon.splice(current_id.value[i], 0, "")
                    } else if (task === Task.HArrowLeft || task === Task.LArrowRight || task === Task.KArrowUp || task === Task.JArrowDown
                               || task === Task.Input) {
                        console.log("beestje1123")

                        _sfon[previous_id.value[i]] = { [line]: Object.values(_sfon[previous_id.value[i]])[0] }

                        break
                    }
                }
            } else {
                console.log("beestje12", previous_id.value, current_id.value, _sfon.slice())

                if (task === Task.Append || task === Task.AppendAppend || task === Task.Insert || task === Task.InsertInsert) {
                    console.log("beestje121")

                    _sfon[previous_id.value[i]] = { [line]: [""] }
                } else if (task === Task.Delete) {
                    console.log("beestje122", previous_id.value, current_id.value, _sfon.slice())

                    if (current_id.value[current_id.value.length - 1] > 0) {
                        _sfon.splice(current_id.value[i], 1)
                        --current_id.value[current_id.value.length - 1]
                    }
                } else if (task === Task.HArrowLeft || task === Task.LArrowRight || task === Task.KArrowUp || task === Task.JArrowDown
                           || task === Task.Input) {
                    console.log("beestje123")

                    if (next_layer_exists()) {
                        _sfon[previous_id.value[i]] = { [line]: Object.values(_sfon[previous_id.value[i]]) }
                    } else {
                        _sfon[previous_id.value[i]] = { [line]: [""] }
                    }
                }

                break
            }
        } else if (data === "element" && (current_coordinate === Coordinates.LeftEditorGeneral
                                          || current_coordinate === Coordinates.LeftEditorInsert
                                          || current_coordinate === Coordinates.LeftEditorNormal
                                          || current_coordinate === Coordinates.LeftEditorVisual)
        ) {
            console.log("beestje2", i, _sfon[previous_id.value[i]])
            if (i < previous_id.value.length - 1 && _sfon[previous_id.value[i]] instanceof Object) {
                console.log("beestje21", previous_id.value, current_id.value, _sfon.slice())

                _sfon = Object.values(_sfon[previous_id.value[i]])[0]

                continue
            } else {
                console.log("beestje22")

                if (task === Task.Append || task === Task.AppendAppend || task === Task.Insert || task === Task.InsertInsert) {
                    console.log("beestje221", previous_id.value, current_id.value, _sfon.slice(), line)

                    _sfon[previous_id.value[i]] = line;
                    if (history !== History.Redo) _sfon.splice(current_id.value[i], 0, "")
                } else if (task === Task.Delete) {
                    console.log("beestje222", previous_id.value, current_id.value, _sfon.slice())

                    _sfon.splice(current_id.value[i], 1)

                    if (current_id.value[current_id.value.length - 1] === 0 && _sfon.length === 0) {
                        console.log("beestje2221")
                        _sfon.splice(current_id.value[i], 0, "")
                    }

                    if (current_id.value[current_id.value.length - 1] > 0) --current_id.value[current_id.value.length - 1]
                } else if (task === Task.HArrowLeft || task === Task.LArrowRight || task === Task.KArrowUp || task === Task.JArrowDown
                           || task === Task.Input) {
                    console.log("beestje223", previous_id.value, current_id.value, _sfon.slice())

                    _sfon[previous_id.value[i]] = line
                }

                break
            }
        }
    }

    console.log("hee", previous_id.value, current_id.value)
    console.log("hee", sfon.value)

    return
}

class ColonError extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, ColonError.prototype);
    }

    get_message() {
        set_error_span(this.message);
        return "ColonError: " + this.message;
    }
}

class UndoError extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, UndoError.prototype);
    }

    get_message() {
        set_error_span(this.message);
        return "UndoError: " + this.message;
    }
}

function set_error_span(message: string) {
    const right = document.getElementById("general_info");

    const old_node: HTMLElement = document.getElementById("error") as HTMLElement;
    const node: HTMLElement = old_node as HTMLElement;
    node.innerHTML =
        "<span style='color: black; padding-left: 1em; padding-right: 1em;'>|</span>";
    node.innerHTML += "<span style='color: red; padding-left: 4px; padding-right: 4px;'>error: " + message + "</span> ";

    right!.replaceChild(old_node, node);
}

enum Coordinates {
    LeftVisitorGeneral = "visitor mode",
    LeftVisitorInsert = "visitor insert mode",
    LeftEditorGeneral = "editor mode",
    LeftEditorInsert = "editor insert mode",
    LeftEditorNormal = "normal mode",
    LeftEditorVisual = "visual mode",
    RightInfo = "info mode",
    RightCommand = "command mode",
    RightFind = "find mode",
}

let current_coordinate: Coordinates = Coordinates.LeftVisitorGeneral
let previous_coordinate = current_coordinate.slice() as Coordinates

enum Commands {
    EditorMode = "editor mode",
    VisitorMode = "visitor mode",
}

let current_command: Commands | undefined = Commands.VisitorMode

let list_index: number = 0

function update_right() {
    console.log("update right", current_coordinate, document.activeElement!.id)
    console.log(document.activeElement!.id)

    let current = document.getElementById(current_id.value.toString()) as HTMLInputElement
    
    let input_right = document.getElementById("input_right")
    let position = 0
    if (input_right) position = getCaretPosition(input_right)
    
    let general_body = document.getElementById("general_body")
    general_body!.innerHTML = ""
    
    let contents = document.createElement("div")
    contents.id = "contents"
    contents.style.overflow = "auto"
    contents.classList = "overflow-hidden whitespace-nowrap w-full max-w-screen-lg mx-auto pt-3 flex-1"
    
    let container = document.createElement("div")
    let placeholder = document.createElement("span")
    placeholder.innerHTML = "filter:"
    placeholder.style.paddingLeft = "4px"
    placeholder.style.paddingRight = "4px"
    
    if (!input_right) {
        input_right = document.createElement("span")
        input_right.id = "input_right"
        input_right.contentEditable = "true"
        input_right.tabIndex = -1
        input_right.style.outline = "none"
    }
    container.appendChild(placeholder)
    container.appendChild(input_right!)
    contents!.appendChild(container)
    
    if (current_coordinate === Coordinates.RightInfo
        || current_coordinate === Coordinates.RightCommand
    ) {
        let list_right = document.createElement('div')
        list_right.id = "list_right"
        if (filtered_list_right.length === 0) filtered_list_right = total_list_right
        for (let i = 0; i < filtered_list_right.length; i++) {
            let radiobox = document.createElement('input')
            radiobox.type = 'radio'
            radiobox.id = 'num' + i
            radiobox.name = "list item"
            if (previous_coordinate === Coordinates.LeftVisitorGeneral
                || previous_coordinate === Coordinates.LeftVisitorInsert
            ) {
                const textarea = document.createElement('textarea')
                textarea.innerHTML = filtered_list_right[i]!.id.toString()
                radiobox.value = textarea.textContent as string
            } else {
                radiobox.value = filtered_list_right[i]!.id.toString()
            }
            let label = document.createElement('label')
            label.htmlFor = 'num' + i
            label.style.paddingLeft = "4px"
            label.style.paddingRight = "4px"
            if (i === list_index) {
                radiobox.checked = true
                label.className = "rounded-sm"
                label.style.backgroundColor = "#C0ECB8" // light green
            }
            const description = document.createTextNode(filtered_list_right[i]!.value)
            label.appendChild(description)
            const newline = document.createElement('br')
            list_right.appendChild(radiobox)
            list_right.appendChild(label)
            list_right.appendChild(newline)
        }
        contents!.appendChild(list_right)
    } else if (current_coordinate === Coordinates.RightFind) {
        current.innerHTML = current.innerText
            .replace( new RegExp( input_right.innerHTML + '(?!([^<]+)?<)', 'gi'),'<mark>$&</mark>'
        )
        contents!.appendChild(current)
    }
    general_body!.appendChild(contents)

    setCaretPosition(input_right, position)
}

function placeCaretOneCharTo(direction: string, el: any) {
    el.focus()

    let _range = document.getSelection()!.getRangeAt(0)
    let range = _range.cloneRange()
    range.selectNodeContents(el.firstChild)
    range.setEnd(_range.endContainer, _range.endOffset)

    if (direction === "left") {
        document.getSelection()!.collapse(el.firstChild, range.toString().length - 1)
    } else if (direction === "right") {
        document.getSelection()!.collapse(el.firstChild, range.toString().length + 1)
    }
}

function placeCaretAtEnd(el: any) {
    el.focus()

    let range = document.createRange()
    range.selectNodeContents(el)
    range.collapse(false)

    let sel = window.getSelection()
    sel!.removeAllRanges()
    sel!.addRange(range)
}

function getCaretPosition(el: any) {
    let caretOffset = 0
    let doc = el.ownerDocument || el.document
    let win = doc.defaultView || doc.parentWindow
    let sel
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection()
        if (sel.rangeCount > 0) {
            let range = win.getSelection().getRangeAt(0)
            let preCaretRange = range.cloneRange()
            preCaretRange.selectNodeContents(el)
            preCaretRange.setEnd(range.endContainer, range.endOffset)
            caretOffset = preCaretRange.toString().length
        }
    }
    return caretOffset;
}

function setCaretPosition(el: any, position: number) {
    const selection = document.getSelection();

    if (!selection || !el) return;

    selection.collapse(el, 0);

    for (let index = 0; index < position; index++) {
        selection.modify('move', 'forward', 'character');
    }
}

</script>

<template>
    <div id="overlay" class="flex flex-col h-screen hidden-content" @keydown="handle_keys($event)" @keyup="handle_input_up($event)">
        <div id="general_info" class="w-full max-w-screen-lg mx-auto">
            <span id="position">&nbsp;</span>
            <span id="error"></span>
        </div>
        <div style="border-bottom: 2px solid #FFE5B4;"></div>
        <div id="general_body" class="flex flex-col flex-1" tabindex="-1">
            <div id="contents"></div>
        </div>
    </div>
</template>

<style lang="css">
html, body {
  height: 100%;
  pointer-events: none;
}

/* #overlay.hidden-content > * {
    visibility: hidden;
} */

.line::before {
    content: "\200D";
    display: inline;
}

.line {
    outline: none;
    display: block;
    width: fit-content;
    min-width: 1em;
    white-space: initial;
}

/* [contenteditable="true"].line {
    white-space: nowrap;
    width:200px;
    overflow: hidden;
}

[contenteditable="true"].line br {
    display:none;

}

[contenteditable="true"].line * {
    display:inline;
    white-space:nowrap;
} */

#general_body:focus {
    outline: none;
}

input[type='radio'] {
    display: none;
}
</style>

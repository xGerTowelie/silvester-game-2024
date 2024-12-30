

"use client"

import { useState } from "react";
import { Button } from "./ui/button";


export default function DebugState({ title, state, disable }: { disable?: boolean, title?: string, state: unknown }) {
    const [toggle, setToggle] = useState(true)

    if (disable) {
        return
    }

    return (
        <pre className="px-5 py-3 bg-slate-900 text-white rounded shadow-sm shadow-black">
            {title && <h1 className={toggle ? "py-0" : "py-3"}>{"//"} Debugging for {title} <Button variant="secondary" size="sm" onClick={() => setToggle(prev => !prev)}>Toggle</Button></h1>}
            {!toggle && JSON.stringify(state, null, 2)}
        </pre>
    )
}



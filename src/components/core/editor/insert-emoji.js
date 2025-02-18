import  React, { useState , useRef } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { OverlayTrigger ,Popover } from 'react-bootstrap'
import { EditorUtils } from '@progress/kendo-react-editor';
import PropTypes from 'prop-types'
import Picker, { SKIN_TONE_MEDIUM_DARK } from 'emoji-picker-react';
import useClickOutside from './hooks/useClickOutside'
export const InsertEmoji = props => {
    const ref = useRef();

    const {
        view,
    } = props;
    const [ open, setOpen ] = useState(false)

    const toggleModal = () => {
        setOpen(!open)
    }

    const state = view && view.state;
    const nodeType = state ? state.schema.nodes[ 'text' ] : undefined;
    const onEmojiClick = (event, emojiObject) => {
        EditorUtils.insertNode(view, view.state.schema.text(emojiObject.emoji), true);

    }

    useClickOutside(ref, () => setOpen(false));

    return <OverlayTrigger
        trigger="click"
        key={ 'bottom' }
        placement={ 'bottom' }
        overlay={
            <Popover id={ `popover-positioned-${ 'bottom' }` }>
                { <Picker
                    onEmojiClick={ onEmojiClick }
                    disableAutoFocus={ true }
                    skinTone={ SKIN_TONE_MEDIUM_DARK }
                    groupNames={ { smileysPeople: 'PEOPLE' } }
                    native
                />}
            </Popover>
        }
    >
        {(state && nodeType && EditorUtils.canInsert(state, nodeType)) ? <Button  title='Insert Emoji' type='button'   onClick={ () => toggleModal() } ><img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTciIGhlaWdodD0iMTciIHZpZXdCb3g9IjE1LjcyOSAyMi4wODIgMTcgMTciIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTI5LjcwOCAyNS4xMDRjLTMuMDIxLTMuMDIyLTcuOTM3LTMuMDIyLTEwLjk1OCAwLTMuMDIxIDMuMDItMy4wMiA3LjkzNiAwIDEwLjk1OCAzLjAyMSAzLjAyIDcuOTM3IDMuMDIgMTAuOTU4LS4wMDEgMy4wMi0zLjAyMSAzLjAyLTcuOTM2IDAtMTAuOTU3em0tLjg0NSAxMC4xMTJhNi41NiA2LjU2IDAgMCAxLTkuMjY4IDAgNi41NiA2LjU2IDAgMCAxIDAtOS4yNjcgNi41NiA2LjU2IDAgMCAxIDkuMjY4IDAgNi41NiA2LjU2IDAgMCAxIDAgOS4yNjd6bS03LjUyNC02LjczYS45MDYuOTA2IDAgMSAxIDEuODExIDAgLjkwNi45MDYgMCAwIDEtMS44MTEgMHptNC4xMDYgMGEuOTA2LjkwNiAwIDEgMSAxLjgxMiAwIC45MDYuOTA2IDAgMCAxLTEuODEyIDB6bTIuMTQxIDMuNzA4Yy0uNTYxIDEuMjk4LTEuODc1IDIuMTM3LTMuMzQ4IDIuMTM3LTEuNTA1IDAtMi44MjctLjg0My0zLjM2OS0yLjE0N2EuNDM4LjQzOCAwIDAgMSAuODEtLjMzNmMuNDA1Ljk3NiAxLjQxIDEuNjA3IDIuNTU5IDEuNjA3IDEuMTIzIDAgMi4xMjEtLjYzMSAyLjU0NC0xLjYwOGEuNDM4LjQzOCAwIDAgMSAuODA0LjM0N3oiLz48L3N2Zz4=" alt="insert emoji" /></Button> : <React.Fragment></React.Fragment>}
    </OverlayTrigger>

};

InsertEmoji.propTypes = {
    view: PropTypes.any
}
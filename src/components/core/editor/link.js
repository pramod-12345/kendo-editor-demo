import * as React from 'react';
import { createPortal } from 'react-dom';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { EditorDialogs } from '@progress/kendo-react-editor';
const InsertLinkDialog = EditorDialogs.InsertLinkDialog;

const LinkDialog = function (props) {
    return (
        <InsertLinkDialog
            { ...props }
            render={ (defaultDialogRendering, { content, actionButtons }) => {

                console.log(defaultDialogRendering.props)
                console.log(content)
                // const { schema } = props.view.state;
                // const a = { ...schema.spec.nodes.get('a') };
                // a.attrs[ 'rel' ]= {
                //     default: 'nofollow',
                // };
                // schema.spec.nodes.update('a', a);
                const cancelButton = actionButtons[ 0 ];
                const insertButton = actionButtons[ 1 ];
                const dialog = (
                    <Dialog
                        { ...defaultDialogRendering.props }
                        title={ 'Custom ' + defaultDialogRendering.props.title }
                    >
                        {content}
                        <DialogActionsBar>
                            {cancelButton} {insertButton}
                        </DialogActionsBar>
                    </Dialog>
                );
                return createPortal(dialog, document.body);
            } }
        />
    );
};

const renderCustomTool = function (toolProps) {
    const { icon, togglable, selected, ...rest } = toolProps;
    let toolState = selected ? ' k-active' : '';
    toolState = toolProps.disabled ? toolState + ' k-disabled' : toolState;
    return (
        <button
            className={
                'k-button k-button-md k-rounded-md k-button-solid k-button-solid-base k-button k-button-md k-rounded-md k-button-solid k-button-solid-base-icon' +
          toolState
            }
            role={ togglable ? 'checkbox' : 'button' }
            aria-checked={ String(selected || false) }
            { ...rest }
        >
            <span role="presentation" className={ 'k-icon k-i-' + icon } />
        </button>
    );
};

// eslint-disable-next-line react/display-name
export const customToolRenderingWithDialog = function (Tool) {
    /* eslint-disable react/display-name */
    return function (props) {
        return (
            <Tool
                { ...props }
                render={ (defaultRendering) => {
                    const tool = defaultRendering[ 0 ];
                    const dialog = defaultRendering[ 1 ];
                    return (
                        <React.Fragment>
                            {renderCustomTool(tool.props)}
                            {dialog && <LinkDialog { ...dialog.props } />}
                        </React.Fragment>
                    );
                } }
            />
        );
    };
};

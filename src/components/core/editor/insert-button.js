import React, { useState } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { EditorUtils } from '@progress/kendo-react-editor';
import { Col, Modal, Row } from 'react-bootstrap';
import { Form } from 'react-bootstrap';
// import { Spinner } from 'react-bootstrap'
import PropTypes from 'prop-types'
import ButtonLoader from '../loader/button-loader';
import { ColorPicker } from '@progress/kendo-react-inputs';

const BTN_SHAPE_TYPES = [ 'Square', 'Rounded', 'Round' ];
const BTN_SIZES = [ 'Regular', 'Large' ];

const BTN_BORDER_RADIUS = {
    'Square': '0px',
    'Rounded': '8px',
    'Round': '100px',
};
const BTN_FONT_SIZE = {
    'Regular': '16px',
    'Large': '20px'
}

const REVERSED_BTN_FONT_SIZE = Object.fromEntries(Object.entries(BTN_FONT_SIZE).map(([ key, value ]) => [ value, key ]));
const REVERSED_BTN_BORDER_RADIUS = Object.fromEntries(Object.entries(BTN_BORDER_RADIUS).map(([ key, value ]) => [ value, key ]));

export const InsertButtonTool = props => {
    const {
        view
    } = props;

    const [ open, setOpen ] = useState(false);
    // const [ inEditView, setEditView ] = useState(false);
    // const [ formData, setFormData ] = useState(null)
    const [ isLoading, setIsLoading ] = useState(false)
    const [ subBtnShape, setSubBtnShape ] = useState('Square')
    const [ subBtnSize, setSubBtnSize ] = useState('Regular')
    const [ btnText, setBtnText ] = useState('Button')
    // const [ useExternalLink, setExternalLink ] = useState(false);
    const [ externalLinkUrl, setExternalLinkUrl ] = useState('');
    const [ openInNewTab, setOpenNewTab ] = useState(true);
    const [ noFollow,setNoFollow ] = useState(false);
    const [ previewBtnColor, setPreviewButtonColor ] = useState('rgba(237, 126, 50, 1)');
    const [ previewBtnTextColor, setPreviewBtnTextColor ] = useState('rgba(255, 255, 255, 1)');
    const [ isButtonTextPickerOpen, setButtonTextPickerOpen ] = useState(false);
    const [ isButtonPickerOpen, setButtonPickerOpen ] = useState(false);
    const [ isBtnError, setBtnError ] = useState(false);
    const [ isExternalErr, setExternalError ] = useState(false);

    const toggleModal = () => {
        setOpen(!open)
    }

    InsertButtonTool.open = (editProps) => {
        if(!open){
            toggleModal();
            const color = window.getComputedStyle(editProps).color; // Get text color
            const backgroundColor = window.getComputedStyle(editProps).backgroundColor; // Get background color
            const innerText = editProps.innerText; // Get the inner text/content
            const onClickHandler = editProps.onclick; // Get the onclick handler (if defined)
            const rel = editProps.getAttribute('rel');
            const urlMatch = onClickHandler.toString().match(/window\.open\(\s*['"]([^'"]+)['"]/);
            const borderRadius = window.getComputedStyle(editProps).borderRadius;
            const padding = window.getComputedStyle(editProps).padding;

            setPreviewBtnTextColor(color);
            setPreviewButtonColor(backgroundColor);
            setNoFollow(rel === 'nofollow' ? true : false);
            setExternalLinkUrl(urlMatch?.[ 1 ] ?? '')
            setOpenNewTab(onClickHandler.toString().includes('_blank') ? true : false);
            setBtnText(innerText);
            setSubBtnShape(REVERSED_BTN_BORDER_RADIUS?.[ borderRadius ]);
            setSubBtnSize(REVERSED_BTN_FONT_SIZE?.[ padding ])
        }
    };

    const resetState = () => {
        setSubBtnShape('Square')
        setSubBtnSize('Regular')
        setBtnText('Button')
        setExternalLinkUrl('')
        setOpenNewTab(false)
        setPreviewButtonColor('rgba(237, 126, 50, 1)');
        setPreviewBtnTextColor('rgba(255, 255, 255, 1)');
        setButtonTextPickerOpen(false)
        setButtonPickerOpen(false)
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        if(!btnText || !btnText?.toString()?.trim()){
            setBtnText(true);
            return
        }

        if(!externalLinkUrl || !externalLinkUrl?.toString()?.trim()){
            setExternalError(true);
            return
        }

        // const schema = view.state.schema;
        // const nodeType = schema.nodes.button;
        // const textNode = schema.text(btnText);
        const style = `
            border: none;
            background-color : ${ previewBtnColor };
            color: ${ previewBtnTextColor };
            border: none;
            padding: ${ BTN_FONT_SIZE?.[ subBtnSize ] };
            border-radius: ${ BTN_BORDER_RADIUS?.[ subBtnShape ] };
        `
        const click = openInNewTab ? `window.open(
            '${ externalLinkUrl }','_blank')` : `window.open('${ externalLinkUrl }')`

        const rel = noFollow ? 'nofollow' : '';
        const id = new Date().getTime();

        const schema = view.state.schema;
        const nodeType = schema.nodes.shortCode;
        const node = nodeType.createAndFill(
            { class: 'shortCode', style: '' },
        );

        EditorUtils.insertNode(view, node);
        view.focus();

        const btnString = `<button class="editor-button" id= "${ id }" style="${ style }" onclick="${ click }" rel="${ rel }">${ btnText }</button>`

        setIsLoading(true);
        setTimeout(() => {
            const currentHtml = EditorUtils.getHtml(view.state);
            const openingTagClippedHtmlSting = currentHtml.replace(/<shortcode class="" style="">/g, btnString);
            const closingTagClippedHtmlString = openingTagClippedHtmlSting.replace(/<\/shortcode>/g, '')
            EditorUtils.setHtml(view, closingTagClippedHtmlString)
            setOpen(!open);
            // setFormData(null);
            resetState();

            setIsLoading(false);
            setTimeout(()=>{
                const elements = document.querySelector('.k-editor-content').getElementsByTagName('button');
                console.log(elements)
                if(elements){
                    console.log(id?.toString())
                    let elementWithId = null;

                    for (const el of elements) {
                        console.log(el.id)
                        if(el.id == id){
                            elementWithId = el;
                        }
                    }
                    // if(elementWithId){
                    //     elementWithId?.scrollIntoView();
                    // }
                    if (elementWithId) {
                        const rect = elementWithId.getBoundingClientRect();
                        const offset = 200; // Offset of 100px
                        const scrollPosition = window.scrollY + rect.top - offset;

                        window.scrollTo({
                            top: scrollPosition,
                            behavior: 'smooth',
                        });
                    }
                }
            },1000)

        }, 1000)
    }

    const handleModal = () => {
        setOpen(!open)
        resetState()
    }

    const state = view && view.state;
    const schema = state && state.schema;
    const nodeType = schema ? schema.nodes.text : undefined;
    const canInsert = view && EditorUtils.canInsert(view.state, nodeType);

    return <React.Fragment>
        <Modal show={ open } onHide={ handleModal } className="button-modal new-modal embed-link-modal" >
            <Modal.Header closeButton>
                <div className="new-modal-header">
                    <Modal.Title>Add Button</Modal.Title>
                </div>
            </Modal.Header>
            <Modal.Body>
                <div className="insert-button-selection template-form-group">
                    <Row>
                        <Col className='templte-section' xs={ 12 } md={ 7 }>
                            <div className="insert-button-template-selection">
                                <div className='left-top-section'>
                                    <Form.Group>
                                        <label>Button Text </label>
                                        <input
                                            className="form-control"
                                            defaultValue={ btnText }
                                            onChange={ (e) => {
                                                setBtnText(e.target.value);
                                            } }
                                            type='text'
                                            name='buttonText'
                                            placeholder='Button'
                                            onFocus={ ()=>{setBtnError(false);setExternalError(false)} }
                                            disabled={ isLoading }
                                        />
                                        {isBtnError && <Form.Text className="text-danger">
                                            Please provide Button Text.
                                        </Form.Text>}
                                    </Form.Group>
                                    <Form.Group>
                                        <div className='left-top-section-color-picker-container'>
                                            <div>
                                                <label>Button Text Color</label>
                                                <ColorPicker
                                                    view="palette"
                                                    defaultValue={ '#ffffff' }
                                                    popupSettings={ { className: 'color-picker' } }
                                                    fillMode="flat"
                                                    value={ previewBtnTextColor }
                                                    onChange={ (e) => { setPreviewBtnTextColor(e.value); setButtonTextPickerOpen(false) } }
                                                    open={ isButtonTextPickerOpen }
                                                    onActiveColorClick={ () => { setButtonTextPickerOpen(true) } }
                                                    disabled={ isLoading }
                                                />

                                            </div>
                                            <div>
                                                <label>Button Color</label>
                                                <ColorPicker
                                                    view="palette"
                                                    defaultValue={ '#ffffff' }
                                                    popupSettings={ { className: 'color-picker' } }
                                                    fillMode="flat"
                                                    value={ previewBtnColor }
                                                    onChange={ (e) => { setPreviewButtonColor(e.value); setButtonPickerOpen(!isButtonPickerOpen) } }
                                                    open={ isButtonPickerOpen }
                                                    onActiveColorClick={ () => { setButtonPickerOpen(true) } }
                                                    disabled={ isLoading }
                                                />

                                            </div>
                                        </div>

                                    </Form.Group>
                                </div>
                                <div className='external-link-box'>
                                    {/* <Form.Group>
                                        <label htmlFor='useExternalLink' className="insert-button-checkbox">
                                            <input id='useExternalLink' name='useExternalLink' type="checkbox" checked={ useExternalLink } onChange={ (event) => {
                                                setExternalLink(event.target.checked)
                                            }
                                            } />
                                            <span className='ml-1'>Use external link</span>
                                        </label>

                                    </Form.Group>
                                    {useExternalLink && <> */}
                                    <>
                                        <Form.Group>
                                            <label>External link </label>
                                            <input
                                                className="form-control"
                                                defaultValue={ externalLinkUrl }
                                                onChange={ (e) => {
                                                    setExternalLinkUrl(e.target.value);
                                                } }
                                                type='text'
                                                name='externalLink'
                                                onFocus={ ()=>{setBtnError(false);setExternalError(false)} }
                                                disabled={ isLoading }
                                            />
                                            {isExternalErr && <Form.Text className="text-danger">
                                                Please provide URL.
                                            </Form.Text>}
                                            {/* {fieldErrors?.externalLink && <span className="field_error"> {fieldErrors.externalLink}</span>} */}
                                        </Form.Group>
                                        <Form.Group>
                                            <label htmlFor='isOpenNewTab' className="insert-button-checkbox">
                                                <input id='isOpenNewTab' name='isOpenNewTab' type="checkbox" checked={ openInNewTab } onChange={ (event) => {
                                                    setOpenNewTab(event.target.checked)
                                                } }
                                                disabled={ isLoading }
                                                />
                                                <span className="ml-1">Open link in new tab</span>
                                            </label>

                                        </Form.Group>
                                        <Form.Group>
                                            <label htmlFor='isOpenNewTab' className="insert-button-checkbox">
                                                <input id='isOpenNewTab' name='isOpenNewTab' type="checkbox" checked={ noFollow } onChange={ (event) => {
                                                    setNoFollow(event.target.checked)
                                                } }
                                                disabled={ isLoading }
                                                />
                                                <span className="ml-1">No-Follow</span>
                                            </label>

                                        </Form.Group>
                                    </>

                                    {/* } */}
                                </div>

                            </div>
                        </Col>
                        <Col className='preview-container' xs={ 12 } md={ 5 }>
                            <div className="insert-button-template-preview">
                                <div className='insert-button-palate header-text-edit wizrd-blog-preview wizrd-inner-preview'>
                                    <h5 className='preview-title'>{'Preview'}</h5>
                                    <div className='preview-section'>

                                        <div className="font-color-selector ">
                                            <button
                                                className='btn btn-primary'
                                                style={ {
                                                    backgroundColor: previewBtnColor,
                                                    borderColor: previewBtnColor,
                                                    color: previewBtnTextColor,
                                                    borderRadius: BTN_BORDER_RADIUS[ subBtnShape ],
                                                    padding: BTN_FONT_SIZE[ subBtnSize ],

                                                } }
                                            >
                                                {btnText || 'button'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='btn-shapes-container'>
                                <label>Button Shape</label>
                                <div className="shape-btn-group">
                                    {
                                        BTN_SHAPE_TYPES.map((btnType) => (
                                            <>
                                                <Button
                                                    className={ btnType === subBtnShape ? `${ btnType }-btn activecls` : `${ btnType }-btn` }
                                                    type='button'
                                                    onClick={ () => {
                                                        setSubBtnShape(btnType);
                                                    } }
                                                    variant="primary"
                                                    name="btnShape"
                                                    disabled={ isLoading }
                                                >
                                                    {btnType}
                                                </Button>
                                            </>
                                        ))
                                    }
                                </div>
                            </div>
                            <div className='btn-size-container'>
                                <label>Button Size</label>
                                <div className="size-btn-group">
                                    {
                                        BTN_SIZES.map((btnType) => (
                                            <>
                                                <Button
                                                    className={ btnType === subBtnSize ? `${ btnType }-btn activecls` : `${ btnType }-btn` }
                                                    type='button'
                                                    onClick={ () => {
                                                        setSubBtnSize(btnType);
                                                    } }
                                                    variant="primary"
                                                    name="btnShape"
                                                    disabled={ isLoading }
                                                >
                                                    {btnType}
                                                </Button>
                                            </>
                                        ))
                                    }
                                </div>
                            </div>
                            <div className="modal-btns">
                                <Button className="btn-close" type='button' onClick={ toggleModal } variant="primary" disabled={ isLoading }>Close</Button>
                                <ButtonLoader
                                    button={ <Button className="btn-close" type='button' onClick={ handleSubmit } variant="primary">confirm</Button> }
                                    loadingText='Saving'
                                    loading={ isLoading }
                                />
                            </div>
                        </Col>
                    </Row>
                </div>
            </Modal.Body>
        </Modal>
        <Button
            title="Button"
            onClick={ () => { toggleModal() } }
            disabled={ !nodeType || !canInsert }
            type="button"
            size='small'
        >
            {/* <span className="k-icon k-i-paste-html" /> */}
            <span><img style={ { width:'25px',height:'25px' } } src={ require('../../../images/button-icon.png') } alt="Button" /></span>
        </Button>
    </React.Fragment>;
};

InsertButtonTool.propTypes = {
    view: PropTypes.any
}
import React, { useRef,useState, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getCategories, getSearchCategories } from 'middleware/blog'
import InputSelect from 'react-select-input'
import _ from 'lodash'
import { CrossCircle } from 'utils/svg'
import { change as reduxChange } from 'redux-form'
import PropTypes from 'prop-types';
import Skeleton  from 'react-loading-skeleton';

const Category = (props) => {
    const { error, setCategoryError,blogForm, site , defaultCategories } = props
    const categoryRef = useRef();
    const [ categoryInput, setCategoryInput ] = useState('')
    const [ selectedItems, setItems ] = useState([ ])
    const dispatch = useDispatch();
    const data  = useSelector((state) => state.blog.categories )
    const [ categories, setCategories ] = useState([  ])
    const categoriesLoading  = useSelector((state) => state.blog.categoriesLoading )
    const searchCategories  = useSelector((state) => state.blog.searchCategories )
    useEffect(() => {
        dispatch(getCategories(site?.id))
    },[])

    useEffect(() => {
        setCategories(searchCategories)
    },[ searchCategories ])

    useEffect(() => {
        if(_.isEmpty(selectedItems)){
            setItems(defaultCategories)
        }
    },[ defaultCategories ])

    const categorySkelton = () => {
        return(
            <>
                <li>
                    <Skeleton width='100%' count={ 1 } />
                </li>
                <li>
                    <Skeleton width='100%' count={ 1 } />
                </li>
            </>
        )
    }

    const handleClear = () => {
        document.querySelector('.ris-clearable').click();
        const element = document.querySelector('.ris-options')
        if(element) element.style.display = 'none'
    }

    const handleSelect = (item) => {
        const arr = [ ...selectedItems ]
        const arrNames = _.map(arr, 'name' )
        if(!arrNames.includes(item.name)){
            item[ 'isDefault' ] = arr.length == 0
            arr.length < 3 && arr.push(item)
        }
        setItems(arr)
        setCategoryError(false)
        handleClear()
        dispatch(reduxChange('blogForm', 'categories', arr))
    }
    const validDefault = (arr) => {
        const defaultArr = arr?.filter((item) => item.isDefault)
        if (_.isEmpty(defaultArr) && arr[ 0 ]){
            arr[ 0 ][ 'isDefault' ] = true
        }
        if( arr.length == 1 && arr[ 0 ] ){
            arr[ 0 ][ 'isDefault' ] = true
        }
    }

    const handleRemove = (event,item) => {
        event.stopPropagation()
        const arr = [ ...selectedItems ]
        _.remove(arr, function (el) {
            return el.name === item.name;
        });
        validDefault(arr)
        setItems(arr)
        dispatch(reduxChange('blogForm', 'categories', arr))
    }

    const getRecentCategories = () => {
        const items = [ ...selectedItems ]
        const arrNames = _.map(items, 'name' )
        let arr = data && data.filter(( item ) => !arrNames.includes(item.name) )
        arr = _.uniqBy(arr, 'name');
        return arr
    }

    const handleAddCustom = (event,ctgrs) => {
        const value = categoryRef.current.input.value?.trim()
        const arr = _.isEmpty(selectedItems)  ?  (ctgrs || []) : [ ...selectedItems ]
        const arrNames = _.map(arr, 'name' )
        if(!arrNames.includes(value) && value){
            const obj = { name: value }
            const defaultArr = arr?.filter((item) => item.isDefault)
            arr.length == 0 && _.merge(obj,{ isDefault: true })
            arr.length < 3 && arr.push(obj)
            if (_.isEmpty(defaultArr)) {  arr[ 0 ][ 'isDefault' ] = true }

        }
        setItems(arr)
        setCategoryError(false)
        handleClear()
        dispatch(reduxChange('blogForm', 'categories', arr))
    }
    const handleChange = (value,isEnter, ctgrs ) => {
        if(isEnter){
            handleAddCustom(value,ctgrs)
        }else{
            dispatch(getSearchCategories(value))

        }
    }
    const makeItDefault = (event, item) => {
        event.stopPropagation()
        const arr = [ ...selectedItems ]
        const coppyArr = arr.map((obj) => {
            if(obj.name === item.name){
                obj[ 'isDefault' ] = true
            }else{
                obj[ 'isDefault' ] = false
            }
            return obj
        })
        setItems(coppyArr)
        setCategoryError(false)
        dispatch(reduxChange('blogForm', 'categories', coppyArr))
    }

    const asyncValidateFunc = _.debounce(handleChange, 800);
    const asyncChangeCallback = useCallback(asyncValidateFunc, []);
    const handleInputChange = (obj) => {
        typeof obj !== 'string' && obj.preventDefault()
        const value = typeof obj === 'string' ? obj.replace(/[\r\n\v]+/g, '') : obj.target.value.replace(/[\r\n\v]+/g, '')
        document.getElementsByClassName('ris-input')[ 0 ].value = value
        setCategoryInput(value)
        asyncChangeCallback(value,obj.nativeEvent.inputType === 'insertLineBreak',blogForm?.values?.categories )
    }
    return(
        <div className='blog-categories'>
            <h4>Category</h4>
            <div className='row blog-cat-input'>
                <div className='col-md-10'>
                    <InputSelect
                        ref={ categoryRef }
                        autoFocus={ true }
                        collapseOnSelect={ true }
                        clearable={ true }
                        className={ 'input-text' }
                        collapseOnBlur={ true }
                        onSelect={ (option) => {
                            option.select && handleSelect(JSON.parse(option.value))}
                        }
                        onChange={ (event) => {
                            handleInputChange(event)
                        } }
                        options={ categoryInput === '' ? [] : categories && categories.map((item) => ({ label: item.name, value: JSON.stringify(item), select: true })) || [] }
                        disableEnter={ false  }

                    />
                </div>
                <div className='col-md-2'>
                    <a href='javascript:void(0)' onClick={ handleAddCustom } className="editLink">Add</a>
                </div>
            </div>
            <div className='items'>
                <ul>
                    { categoriesLoading && categorySkelton() }
                    { !categoriesLoading && selectedItems && selectedItems.map((item, index) => {
                        return(<li
                            className={ `badge  ${ item.isDefault && 'default' }` }
                            onClick={ (event) => makeItDefault(event,item) }  key={ index } >
                            { item.name }
                            <a href='javascript:void(0)' onClick={ (event) => handleRemove(event,item) } >{ CrossCircle()}</a>
                        </li>)
                    })}

                </ul>
                <span className='field_error'>{ error } </span>
                <h3>Recent Categories</h3>
                <ul>
                    { categoriesLoading && categorySkelton() }
                    { !categoriesLoading && getRecentCategories() && getRecentCategories().map((item, index) => {
                        return(<li
                            className={ 'badge ' }
                            onClick={ () => handleSelect(item) }  key={ index } >
                            { item.name }
                        </li>)
                    })}

                </ul>
            </div>
        </div>

    )
}

Category.propTypes = {
    error: PropTypes.string,
    setCategoryError: PropTypes.func,
    site: PropTypes.object,
    blogForm: PropTypes.object,
    defaultCategories: PropTypes.array
};
export default Category
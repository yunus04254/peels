import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useRef } from 'react';
import './../../styles/components/Quill.css';
import { useMediaQuery } from "@react-hook/media-query"
import useSize from '@react-hook/size'
import Delta from 'quill-delta';

function Quill(props) {
  const [value, setValue] = useState('');
  const isMobile = useMediaQuery("(max-width: 450px)")
  const quill = useRef();
  const quill_container = document.getElementsByClassName(props.id)[0];
  const [current_width, current_height] = useSize(quill_container);
  const [hideText, setHideText] = React.useState(true);
  const isBigEnoughToHide = current_height >= 149;
  const isHideEnabled = isBigEnoughToHide && props.hideEnabled;

  const handleClickToShow = () => {
    setHideText(false);
  }

  const handleClickToHide = () => {
    setHideText(true);
  }

  function update(content,delta,source,editor) {
    const newContent = quill.current.getEditor().getContents();
    if (newContent !== value) {
      setValue(newContent);
      props.onChange(newContent);
    }
  }

  React.useEffect(() => {
    if (props.contents) {
      const delta = new Delta(props.contents);
      setValue(delta);
    }
  }, [props.contents]);

  let modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, false] },],
      ['bold', 'italic', 'underline','strike', 'blockquote', { 'color': [] }, ],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link',],
    ],
  }; 

  if (isMobile) {
    modules = {
      toolbar: [
        [{ 'header': [1, 2, 3, 4, false] },],
        ['bold', 'italic',{ 'color': [] }, ],
      ],
    };
  }

  let formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote', 'color',
    'list', 'bullet', 'indent',
    'link',
  ];

  if (props.formats) {
    formats = props.formats;
  }
  if (props.modules) {
    modules = props.modules;
  }
  if (props.readOnly) {
    modules = {toolbar: false};
  }

  var hideTextCSS = "";

  if (isHideEnabled) {
    if (hideText) {
      hideTextCSS = `
        .${props.id} .ql-container{
          max-height: 150px;
        }
      `;
    } else {
      hideTextCSS = `
        .${props.id} .ql-container{
          max-height: none;
        }
      `;
    }
  }

  return (
  <>
  <style>
      {hideTextCSS}
      {props.style}
    
  </style>

  
  <ReactQuill theme="snow" 
                     value={value} 
                     onChange={update} 
                     modules={modules}
                     formats={formats}
                     ref={quill}
                     readOnly={props.readOnly}
                     className={(props.className?props.className:"")+ " " + props.id}
                     />
                  {hideText && isHideEnabled &&(
                        <div>
                            <a onClick={handleClickToShow} className="text-blue-500 cursor-pointer">
                                Show more
                            </a>
                        </div>
                    )}
                {!hideText && isHideEnabled && (
                      <div>
                          <a onClick={handleClickToHide} className="text-blue-500 cursor-pointer">
                              Show less
                          </a>
                      </div>
                  )}
  </>
  )
}

export default Quill;
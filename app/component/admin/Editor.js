"use client";
import React, { useRef } from 'react';
import { Editor as TinyMCEEditor } from '@tinymce/tinymce-react';

export default function Editor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);

  return (
    <div className="w-full">
      <TinyMCEEditor
        tinymceScriptSrc={'/tinymce/tinymce.min.js'}
        onInit={(evt, editor) => editorRef.current = editor}
        value={value}
        onEditorChange={onChange}
        init={{
          height: 400,
          menubar: false,
          license_key: 'gpl', // This fixes the license key requirement for self-hosted
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: 'body { font-family:Inter,Helvetica,Arial,sans-serif; font-size:14px }',
          placeholder: placeholder || 'Write something amazing...',
          branding: false,
          promotion: false,
          skin: 'oxide',
          content_css: 'default',
          base_url: '/tinymce',
          suffix: '.min'
        }}
      />
    </div>
  );
}

import express from 'express';

// TODO skráningar virkni
const app = express();

export function existing(val){
  if(val) return true;
  return false;
}

export function time(d){
  return `${d.getDate()}.${d.getMonth()+1}.${d.getFullYear()}`
}



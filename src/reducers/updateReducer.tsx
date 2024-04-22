export default function updateReducer(dispatchFn: (obj: object) => obj) {
  return function(
    field: string, 
    setValueFn: (value: any) => any = null
  ): void {
    return function(event: React.FormEvent<HTMLInputElement>): void {
      let value = event.target.value;
      let newValue = setValueFn ? setValueFn(value) : value;
      dispatchFn({
        type: "set",
        payload: { 
          [field]: newValue
        }
      });
    };
  }
}



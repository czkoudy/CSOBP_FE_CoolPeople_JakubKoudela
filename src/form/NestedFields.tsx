/**
 * Zde vytvořte formulářové vstupy pomocí react-hook-form, které:
 * 1) Budou součástí formuláře v MainForm, ale zůstanou v odděleném souboru
 * 2) Reference formuláře NEbude získána skrze Prop input (vyvarovat se "Prop drilling")
 * 3) Získá volby (options) pro pole "kategorie" z externího API: https://dummyjson.com/products/categories jako "value" bude "slug", jako "label" bude "name".
 *
 *
 * V tomto souboru budou definovány pole:
 * allocation - number; Bude disabled pokud není amount (z MainForm) vyplněno. Validace na min=0, max=[zadaná hodnota v amount]
 * category - string; Select input s volbami z API (label=name; value=slug)
 * witnesses - FieldArray - dynamické pole kdy lze tlačítkem přidat a odebrat dalšího svědka; Validace minimálně 1 svědek, max 5 svědků
 * witnesses.name - string; Validace required
 * witnesses.email - string; Validace e-mail a asynchronní validace, že email neexistuje na API https://dummyjson.com/users/search?q=[ZADANÝ EMAIL]  - tato validace by měla mít debounce 500ms
 */

import { useEffect, useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { FormValues } from "./MainForm";

type Category = {
  value: string;
  label: string;
};

const NestedFields = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<FormValues>();
  const [categories, setCategories] = useState<Category[]>([]);
  const { fields, append, remove } = useFieldArray({
    control,
    name: "witnesses",
  });
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("https://dummyjson.com/products/categories");
      const data = await response.json();
      const formatData = data.map((item: { slug: string; name: string }) => ({
        value: item.slug,
        label: item.name,
      }));
      setCategories(formatData);
    };

    fetchData();

    return () => {
      setCategories([]);
    };
  }, []);

  return (
    <>
      <div>
        <label htmlFor="allocation">Allocation</label>
        <Controller
          name="allocation"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="number"
              id="allocation"
              style={{ borderColor: errors.allocation ? "red" : undefined }}
            />
          )}
        />
        {errors.allocation && (
          <p style={{ color: "red" }}>{errors.allocation.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="category">Category</label>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <select {...field}>
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          )}
        />
        {errors.category && (
          <p style={{ color: "red" }}>{errors.category.message}</p>
        )}
      </div>

      <h3>Witnesses</h3>

      {fields.map((field, index) => {
        return (
          <div key={field.id}>
            <Controller
              name={`witnesses.${index}.name`}
              control={control}
              rules={{ required: "Name is required" }}
              render={({ field, fieldState }) => (
                <>
                  <input
                    {...field}
                    style={{
                      borderColor: fieldState.error ? "red" : undefined,
                    }}
                  />
                  {fieldState.error && <p>{fieldState.error.message}</p>}
                </>
              )}
            />
            <Controller
              name={`witnesses.${index}.email`}
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <input
                    {...field}
                    style={{
                      borderColor: fieldState.error ? "red" : undefined,
                    }}
                  />
                  {fieldState.error && <p>{fieldState.error.message}</p>}
                </>
              )}
            />
            <button type="button" onClick={() => remove(index)}>
              Delete
            </button>
          </div>
        );
      })}
      {errors.witnesses?.root?.message && (
        <p>{errors.witnesses.root.message}</p>
      )}

      <button type="button" onClick={() => append({ name: "", email: "" })}>
        Add Witness
      </button>
    </>
  );
};

export default NestedFields;

import React, { useCallback, useEffect, useRef, useState } from 'react';
import debounce from 'lodash.debounce';

import { Person } from '../types/Person';
import classNames from 'classnames';

type Props = {
  delay: number;
  people: Person[];
  onPersonSelect: (person: Person | null) => void;
};

export const Autocomplete: React.FC<Props> = ({
  delay,
  people,
  onPersonSelect = () => {},
}) => {
  const [query, setQuery] = useState('');
  const [suggestedPeople, setSuggestedPeople] = useState<Person[]>(people);
  const [isListVisible, setIsListVisible] = useState(false);

  const debouncedSuggestedPeople = useRef(
    debounce((filteredPeople: Person[]) => {
      setSuggestedPeople(filteredPeople);
    }, delay),
  ).current;

  useEffect(() => {
    return () => {
      debouncedSuggestedPeople.cancel();
    };
  }, [debouncedSuggestedPeople]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);

      const filteredPeople = people.filter(person =>
        person.name.toLowerCase().includes(e.target.value.toLowerCase()),
      );

      debouncedSuggestedPeople(filteredPeople);
      onPersonSelect(null);
    },
    [people, debouncedSuggestedPeople, onPersonSelect],
  );

  const handleBlur = useCallback(() => {
    setIsListVisible(false);
  }, []);

  const handlePersonSelect = useCallback(
    (person: Person) => {
      onPersonSelect(person);
      setQuery(person.name);
    },
    [onPersonSelect],
  );

  return (
    <>
      <div className={classNames('dropdown', { 'is-active': isListVisible })}>
        <div className="dropdown-trigger">
          <input
            type="text"
            placeholder="Enter a part of the name"
            className="input"
            data-cy="search-input"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsListVisible(true)}
            onBlur={handleBlur}
          />
        </div>

        <div className="dropdown-menu" role="menu" data-cy="suggestions-list">
          <div className="dropdown-content">
            {!!suggestedPeople.length ? (
              suggestedPeople.map(person => (
                <div
                  key={person.slug}
                  className="dropdown-item"
                  data-cy="suggestion-item"
                  onMouseDown={() => handlePersonSelect(person)}
                >
                  <p className="has-text-link">{person.name}</p>
                </div>
              ))
            ) : (
              <div
                className="
                  notification
                  is-danger
                  is-light
                  mt-3
                  is-align-self-flex-start
                "
                role="alert"
                data-cy="no-suggestions-message"
              >
                <p className="has-text-danger">No matching suggestions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
import _ from "lodash";
import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import FoldCard from "../components/FoldCard";
import SuccessionRelationChip from "../components/SuccessionRelationChip";
import { Chara, SuccessionRelation } from "../data/data_pb";
import * as UMDatabaseUtils from "../data/UMDatabaseUtils";
import UMDatabaseWrapper from "../data/UMDatabaseWrapper";

const GROUP_TYPE_TAGS: Record<string, string> = {
    '1': '学年',
    '2': '宿舍',
    '3': '同室',
    '20': '同父系',
    '21': '父方祖父／母方祖父',
    '23': '母方父系',
    '25': 'G1 胜场',
    '26': '性别・？',
    '27': '出生日期',
    '28': '出生年份',
    '29': '跑法适性',
    '30': '距离适性',
    '31': '场地适性',
    '32': '出生月份',
};


export default function SuccessionRelationsPage() {
    const [selectedCharas, setSelectedCharas] = useState<Chara[]>([]);
    const [showRelationId, setShowRelationId] = useState(false);

    function renderRelationsGroups(relations: SuccessionRelation[], key: string) {
        return <FoldCard header={`Relations ${key}xx ${GROUP_TYPE_TAGS[key] ?? ''}`}>
            {UMDatabaseUtils.findSuccessionRelation(selectedCharas, relations)
                .map(r => <><SuccessionRelationChip relation={r} showId={showRelationId} />{' '}</>)}
        </FoldCard>;
    }

    const relationsGroups = _.groupBy(UMDatabaseWrapper.umdb.successionRelation,
        r => Math.floor(r.relationType! / 100));

    return <>
        <Form.Group>
            <Form.Label>Filter by</Form.Label>
            <Typeahead
                multiple
                labelKey={UMDatabaseUtils.charaNameWithIdAndCast}
                options={UMDatabaseWrapper.umdb.chara}
                selected={selectedCharas}
                onChange={setSelectedCharas}
                filterBy={UMDatabaseUtils.charaTypeaheadMatcher} />
        </Form.Group>

        <Form.Group>
            <Form.Switch
                checked={showRelationId}
                onChange={(e) => setShowRelationId(e.target.checked)}
                id="show-relation-id"
                label="Show SuccessionRelationMember IDs" />
        </Form.Group>

        {_.map(relationsGroups, (g, k) => renderRelationsGroups(g, k))}
    </>;
}
